# MayaBatch 플러그인 OCIO 패치

Deadline 10.4.2.2 / Maya 2026 / MtoA 5.5.3 환경에서 **Arnold 배치 렌더가 즉시 중단되는 문제**를 해결하는 패치다.

적용 대상 파일:

```
\\<NAS>\deadline_repo\plugins\MayaBatch\MayaBatch.py
```

---

## 증상

작업이 `Completed`로 표시되는데 결과물이 생성되지 않는다. Task 소요 시간은 수 초, 평균 CPU 사용률 1%.

```
ERROR   | [color_manager_ocio] could not read
          '<MAYA_RESOURCES>/OCIO-configs/Maya-legacy/config.ocio' OCIO profile.
WARNING | Aborted by user: received abort signal
Error: RuntimeError: [mtoa] Failed batch render
```

---

## 원인

Maya 제출기는 색 관리 설정 경로를 `<MAYA_RESOURCES>` 토큰이 포함된 문자열로 전달한다. 이 토큰은 **Maya 내부에서만 치환**되며 OS 환경변수로는 해석되지 않는다.

MayaBatch 플러그인은 이 값을 그대로 환경변수 `OCIO`에 주입한다 (322행).

```python
ocioConfig = self.GetPluginInfoEntryWithDefault( "OCIOConfigFile", "" )
...
elif ocioConfig:
    self.SetEnvironmentAndLogInfo("OCIO", RepositoryUtils.CheckPathMapping( ocioConfig ))
```

Arnold는 존재하지 않는 경로를 읽으려다 렌더를 중단한다.

### 씬 설정으로는 우회할 수 없다

Maya의 Color Management를 꺼도 해결되지 않는다. 색 관리를 끄면 Arnold가 자체 기본 관리자 `ai_default_color_manager_ocio`로 넘어가는데, 그것 역시 같은 환경변수를 읽는다.

Deadline Monitor의 **Job Environment로 덮어쓰는 것도 실패**한다. 플러그인이 렌더 직전에 다시 설정하기 때문이다.

---

## 패치

### Before

```python
elif ocioConfig:
    self.SetEnvironmentAndLogInfo("OCIO", RepositoryUtils.CheckPathMapping( ocioConfig ))
```

### After

```python
elif ocioConfig:
    _ocio = RepositoryUtils.CheckPathMapping( ocioConfig ).replace(
        "<MAYA_RESOURCES>", "C:/Program Files/Autodesk/Maya2026/resources")
    if not os.path.isfile( _ocio ):
        _ocio = "C:/Program Files/Autodesk/Maya2026/resources/OCIO-configs/Maya-legacy/config.ocio"
    self.SetEnvironmentAndLogInfo("OCIO", _ocio)
```

동작:

1. 토큰을 Maya 2026 설치 경로로 치환한다
2. 치환된 경로가 Worker에 **실제로 존재하지 않으면** 기본 설정으로 되돌린다

2번이 필요한 이유는 작업 PC의 Maya 버전이 제각각이기 때문이다. Maya 2025에서 저장된 씬은 토큰이 아닌 실제 경로(`C:/Program Files/Autodesk/Maya2025/resources/...`)를 전달하며, 그 설치본의 OCIO 폴더가 누락된 사례가 실제로 있었다.

---

## PowerShell 일괄 적용

```powershell
$f = "\\223.194.101.83\deadline_repo\plugins\MayaBatch\MayaBatch.py"
Copy-Item $f "$f.bak"
$t = [IO.File]::ReadAllText($f)
$old = 'self.SetEnvironmentAndLogInfo("OCIO", RepositoryUtils.CheckPathMapping( ocioConfig ))'
$nl = "`r`n"
$new = '_ocio = RepositoryUtils.CheckPathMapping( ocioConfig ).replace("<MAYA_RESOURCES>", "C:/Program Files/Autodesk/Maya2026/resources")' + $nl +
       '            if not os.path.isfile( _ocio ):' + $nl +
       '                _ocio = "C:/Program Files/Autodesk/Maya2026/resources/OCIO-configs/Maya-legacy/config.ocio"' + $nl +
       '            self.SetEnvironmentAndLogInfo("OCIO", _ocio)'
$t = $t.Replace($old, $new)
[IO.File]::WriteAllText($f, $t, (New-Object Text.UTF8Encoding $false))
findstr /n "_ocio" $f
```

들여쓰기 12칸/16칸이 유지되어야 한다. `os`는 같은 파일에서 이미 import되어 있다.

---

## 검증 시 주의 — Requeue로는 반영되지 않는다

Worker는 Repository의 플러그인을 **Job ID별 폴더에 복사해 캐시**한다.

```
C:\ProgramData\Thinkbox\Deadline10\workers\<Worker명>\plugins\<JobID>\MayaBatch.py
```

같은 Job을 Requeue하면 Job ID가 유지되므로 캐시된 이전 버전이 실행된다. **반드시 새 Job으로 제출**해야 Repository에서 새로 복사해 간다.

---

## 정상 동작 확인

새 Job의 Task 로그에서 네 줄을 확인한다.

```
Setting Process Environment Variable OCIO to C:/Program Files/Autodesk/Maya2026/resources/...
[network] authorized for "88169ARNOL_2026_0F"
100% done
[driver_png] writing file '//<NAS>/2026_renderfarm/output/...'
```

첫 줄이 `<MAYA_RESOURCES>`가 아닌 실제 경로여야 한다.

---

## 함께 필요한 설정 — 플러그인 실행 경로

```
Deadline Monitor → Tools → Configure Plugins → MayaBatch
```

| 설정 항목 | 값 |
| --- | --- |
| Maya 2023 Render Executable | `C:\Program Files\Autodesk\Maya2026\bin\MayaBatch.exe` |
| Maya 2024 Render Executable | (동일) |
| Maya 2025 Render Executable | (동일) |
| Maya 2026 Render Executable | (동일) |

이 팜의 Arnold 라이선스는 `88169ARNOL_2026_0F` **2026 전용 feature 하나뿐**이다. Maya 2025로 실행하면 2025용 feature를 요청하다 `[clm.v1] generic license checkout error (22)`로 실패한다.

전 버전을 2026으로 보내면 어떤 버전의 씬이 들어와도 Maya 2026이 열어서 렌더한다. 로그에 다음과 같이 찍히는 것이 정상이다.

```
INFO: Rendering with Maya Version 2025.0              ← 씬의 버전
INFO: Executable: "C:\...\Maya2026\bin\MayaBatch.exe"  ← 실제 실행 파일
```

> **이 두 설정은 Repository를 재설치하거나 복원하면 사라진다.** 그 경우 Maya 렌더가 전부 실패하므로 가장 먼저 다시 적용해야 한다.
