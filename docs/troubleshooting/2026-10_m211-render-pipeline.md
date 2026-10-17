# 트러블슈팅 — M211 렌더 파이프라인 (2026년 10월)

Maya → Deadline → Worker → NAS 전 구간이 동작하기까지 해결한 문제들의 기록이다.

| No. | 이슈 | 원인 | 상태 |
| --- | --- | --- | --- |
| #008 | OCIO 환경변수로 렌더 중단 | `<MAYA_RESOURCES>` 토큰 미치환 | ✅ 해결 |
| #009 | 실패한 렌더가 Completed로 표시 | Strict error checking이 mtoa 오류 무시 | ✅ 판별법 확립 |
| #011 | Arnold 라이선스 인증 실패 | 2026 전용 feature만 발급됨 | ✅ 해결 |
| #012 | 라이선스 서버 구조 오인 | RLM(Nuke)과 FlexLM(Arnold) 혼동 | ✅ 정정 |
| #013 | Maya 버전별 라이선스 제약 | 2025용 feature 부재 | ✅ 해결 |
| #015 | OCIO 토큰 미치환 | 플러그인이 제출 값을 그대로 주입 | ✅ 해결 |
| #016 | 외부 씬의 깨진 OCIO 경로 | 작업 PC 설치본 손상 | ✅ 해결 |
| #017 | GPU 부족으로 부분 실패 | VRAM 점유 — Arnold는 CPU 폴백 없음 | ✅ 해결 |
| #018 | 블렌더 렌더 크래시 (code 11) | Worker 블렌더 버전이 씬보다 낮음 | ⏳ 설치 대기 |
| #019 | Worker Repository 연결 오류 | 오래된 인증서 경로·자격증명 충돌 | ⏳ 진행 중 |

---

## #009 — 실패한 렌더가 Completed로 표시된다

가장 먼저 알아야 할 항목이다. 이것 때문에 다른 모든 문제의 발견이 늦어졌다.

Deadline의 strict error checking은 mtoa 오류를 "unrecognized error"로 분류해 무시한다. 결과적으로 **렌더가 중단되어도 Job은 100% Completed로 표시**된다.

### 판별 기준

| 지표 | 실패 신호 |
| --- | --- |
| Task Time | 수 초 이내 종료 |
| 평균 CPU 사용률 | 1% 수준 |
| Task 로그 | `% done` 진행률이 없음 |
| 결과물 | 장수가 프레임 수와 불일치 |

운영 시에는 Job 상태가 아니라 **결과물 수량으로 교차 검증**해야 한다.

---

## #011 ~ #013 — Arnold 라이선스 구조

### 서버 구성

라이선스 서버는 M211-00 한 대에 집중되어 있다.

| 라이선스 매니저 | 포트 | 제품 |
| --- | --- | --- |
| Autodesk FlexLM (`lmgrd` + `adskflex`) | **27000** | Arnold |
| Foundry RLM (`rlm.foundry`) | 5053 | Nuke |

### 흔한 오해

Arnold와 Nuke가 **둘 다 RLM 계열**이라는 점 때문에 다음 두 가지를 혼동하기 쉽다.

- `Arnold License`라는 이름의 Windows 서비스가 실제로는 `lmgrd.exe`(Autodesk FlexLM)다
- Worker의 `solidangle_LICENSE = 5053@M211-00` 설정은 **Arnold 라이선스가 없는 Foundry 서버**를 가리킨다

Arnold가 봐야 할 곳은 `ADSKFLEX_LICENSE_FILE = @M211-00` (포트 27000)이다.

### 발급된 feature

```
lmutil lmstat -a -c 27000@localhost

  라이선스 파일: C:\Autodesk\Network License Manager\Licenses\ARNOL2026kolicense.lic
  vendor daemon: adskflex UP
  feature      : 88169ARNOL_2026_0F  (3000석, 만료 2027-06-25)
```

**2026 전용이다.** Maya 2025 + MtoA 5.4.5는 `ARNOL_2025_0F`를 요청하므로 실패한다.

```
[clm.v1] generic license checkout error (22)
→ rendering with watermarks because of failed authorization
→ aborting render because this is a batch render and abort_on_license_fail is enabled
```

### 운영상 제약

**M211-00은 항상 켜져 있어야 한다.** 이 PC가 꺼지면 전체 팜의 Arnold 렌더가 전부 실패한다. Deadline Worker 목록에서 M211-00이 Offline으로 보여도 무관하다 — Worker 역할과 라이선스 서버 역할은 별개다.

---

## #015 ~ #016 — OCIO 환경변수

→ [`patches/MayaBatch-ocio.md`](../../patches/MayaBatch-ocio.md) 참조

---

## #017 — GPU 메모리 부족에 의한 부분 실패

외부 씬 테스트에서 3프레임 중 1프레임만 실패했다. Job 상태는 `Completed`였다.

```
M211-05 : GPU 9420MB available  →  렌더 성공
M211-07 : GPU  373MB available  →  ERROR | [gpu] no GPU matching requirements
                                           found for GPU-rendering
                                   →  Error: RuntimeError: [mtoa] Failed batch render
```

Arnold는 VRAM이 부족해도 **CPU로 폴백하지 않고 렌더를 중단한다.** 동일한 작업이 Worker의 GPU 점유 상태에 따라 갈린다.

### 대책

공용 팜에서는 **Render Device를 CPU로 고정**한다.

```
Render Settings → Arnold Renderer → System → Render Device = CPU
```

Worker는 20코어 CPU와 64GB 메모리를 갖추고 있어 CPU 렌더로도 충분하며, 무엇보다 결과가 PC 상태에 좌우되지 않는다.

GPU 모드의 실패는 240프레임 중 몇 장만 조용히 누락되는 형태로 나타나므로 발견이 늦다.

---

## 외부 파일 반입 시 참조 유실

씬 파일만 주고받으면 텍스처와 레퍼런스가 전부 빠진다. 씬에는 파일 자체가 아니라 **경로만** 기록되기 때문이다.

실제 사례 (졸업작품 샷 39MB):

| 항목 | 수량 | 경로 |
| --- | --- | --- |
| 텍스처 | 42개 | `D:/Projects/OVER/Prod/texture/...` |
| 레퍼런스 | 1개 | `D:/Projects/.../g80_Rigging_master.ma` |

로그에 다음과 같이 나타난다.

```
Warning: Reference file not found. : D:/...
WARNING | [texturesys] unable to load an image from the path: "D:/..."
```

문제는 **이 상태로도 렌더가 중단되지 않는다**는 점이다. 텍스처 없이, 캐릭터가 빠진 채로 완료된다.

### 대책

파일을 보내는 쪽이 마야의 **File → Archive Scene**을 사용한다. 씬이 참조하는 텍스처·레퍼런스·캐시가 전부 zip으로 묶인다.

받는 쪽은 씬을 연 뒤 **Windows → General Editors → File Path Editor**에서 빨간 줄(못 찾는 파일)이 없는지 확인한다.

### 사전 점검

`.mb` 파일을 열지 않고도 문자열 스캔으로 참조 목록을 추출할 수 있다. 추출 가능한 항목:

- 참조 텍스처 경로
- 레퍼런스 파일 경로
- `defaultColorMgtGlobals`의 OCIO 설정
- `defaultResolution`의 가로·세로
- `playbackOptions`의 프레임 범위

제출 전 자동 검증 도구로 발전시킬 여지가 있다.

---

## #018 — 블렌더 Worker 버전 불일치로 크래시

졸준위가 제공한 `.blend`(878MB)로 첫 블렌더 테스트를 했을 때 `Renderer returned non-zero error code, 11` 로 크래시했다. 원인은 로그 두 줄로 확정됐다.

```
Executable: "C:\Program Files\blender-4.5.3-windows-x64\...\blender.exe"
Warning: File written by newer Blender binary (502.45), expect loss of data!
```

Deadline Blender 플러그인이 **4.5.3**을 가리키는데 씬은 **5.2**로 저장된 것이다. 블렌더는 상위 호환이 되지 않는다.

### Worker별 버전이 제각각이었다

| Worker | 설치 버전 |
| --- | --- |
| M211-18 | 5.2.2 LTS |
| M211-11 | 4.5.3 |

Deadline Blender 플러그인의 `Blender Executable` 필드는 **줄바꿈으로 구분된 목록**을 받고, 존재하는 첫 경로를 사용한다. 5.2 경로를 목록 맨 위에 미리 넣어두면 설치 완료 시점에 자동으로 전환된다.

### 블렌더 경로 표기

**블렌더에서 `//` 는 UNC가 아니라 `.blend` 파일 기준 상대경로다.**

```
마야     //223.194.101.83/2026_renderfarm/...     ✅
블렌더   \\223.194.101.83\2026_renderfarm\...     ✅
블렌더   //223.194.101.83/...                     ❌  엉뚱한 곳에 저장됨
```

마야에서 쓰던 형식을 그대로 붙여넣는 실수가 흔하므로 학생 매뉴얼에 명시했다.

### 기타

- 제출 시 `Submit Blender Scene File With The Job` 은 체크하지 않는다 — 878MB 씬이 Repository에 복사되어 볼륨을 채운다
- 버전 외의 파이프라인은 전부 정상이었다: NAS UNC에서 씬 읽기, 출력 경로 전달, 오브젝트 동기화, 텍스처 누락 경고 없음

---

## #019 — Worker 복구: Repository 연결 오류

장기간 꺼져 있던 Worker를 되살릴 때 반복해서 나온 오류다.

```
The Monitor was unable to connect to the specified Repository
(\\223.194.101.83\deadline_repo)
```

### 진행 경과 (M211-13)

| 단계 | 증상 | 조치 |
| --- | --- | --- |
| 1 | 인증서 경로가 `Z:/certs/Deadline10Client.pfx` — 존재하지 않는 매핑 드라이브 | 인증서 설정 해제 |
| 2 | 공유 접근 불가 | 탐색기에서 NAS 자격증명 입력 |
| 3 | "동일한 사용자가 둘 이상의 사용자 이름으로 다중 연결할 수 없습니다" | `net use * /delete /y` |
| 4 | DB 호스트는 도달(`Test-NetConnection 223.194.103.39 -Port 27100` True)하나 `MongoDBServerSetup`에서 `System.NullReferenceException` | 클라이언트 재설치 |

### 재설치 시 주의

**NAS에서 설치 파일을 직접 실행하면 실패한다.**

```
Error copying file from packed archive //223.194.101.83/deadline_repo/...
to C:/Program Files/Thinkbox/Deadline10/bin/deadlinemonitor.dll
```

설치 파일을 로컬(`C:\`)로 복사한 뒤 관리자 권한으로 실행해야 한다. 기존 Deadline 프로세스(`deadlinemonitor` / `deadlineworker` / `deadlinelauncher`)도 미리 종료한다.

설치 옵션:

| 항목 | 값 |
| --- | --- |
| Installation Type | Client |
| Connection | Direct Connection |
| Repository Path | `\\223.194.101.83\deadline_repo` |
| Remote control / Auto upgrade | Use the Repository settings |

### 미해결 — 클라이언트 인증서 사용 여부

상반된 증거가 있다.

| 출처 | 내용 |
| --- | --- |
| M211-18의 `deadline.ini` | `DbSSLCertificate=` (빈 값) — 인증서 없이 동작 중 |
| PRFS 1.0 문서 (2025) | 같은 오류의 해법으로 `Deadline requires Client Certification` 체크 후 `\\223.194.101.83\deadline_repo\certs\Deadline10Client.pfx` 지정 |

2026년 9월 서버 재구축(RCS 전환) 때 인증서가 제거됐을 가능성이 있다.

**판별법** — `\\223.194.101.83\deadline_repo\certs\` 폴더와 `.pfx` 파일의 현존 여부를 확인한다. 있으면 인증서 방식, 없으면 M211-18 방식이 맞다.
