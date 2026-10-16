# M211 렌더팜 사용 매뉴얼

> **시스템명**: PRFS — Phoenix Render Farm System
> **대상 실습실**: M211
> **작성자**: 이상빈 (영상·애니메이션 전공)
> **지도교수**: 송정진
> **문서 버전**: v1.3 (2026년 10월 17일)
>
> v1.3 변경: Archive Scene 안내(3-5), Render Device CPU 지정(4-3), 부분 실패 진단(7-6) 추가
>
> v1.2 변경: Arnold 라이선스 구조 정정(FlexLM 27000), Maya 2026 요구사항 명시, MayaBatch 플러그인 필수 패치(14장) 추가

---

## 이 문서에 대하여

본 문서는 M211 실습실 렌더팜을 **학생이 직접 사용할 수 있도록** 안내하는 매뉴얼이다.

- **1부 — 사용자 가이드**: 예약부터 결과물 수령까지, 학생이 알아야 할 전부
- **2부 — 운영자 가이드**: 시스템 구조, 예약 시트 구축, 장애 대응

처음 사용하는 학생은 1부만 읽으면 된다.

---

# 1부 — 사용자 가이드

## 1. 시작하기 전에

### 1-1. 렌더팜이 무엇인가

렌더링은 3D 작업 중 가장 오래 걸리는 단계다. 개인 PC 한 대로 밤새 돌려야 할 작업을, 실습실의 여러 대가 나눠서 처리하면 시간을 크게 줄일 수 있다. 이렇게 여러 대를 묶어 렌더링을 분산 처리하는 시스템을 렌더팜이라 한다.

```
[내 작업 파일]
      ↓ 제출
[Deadline 서버] ← 작업을 쪼개서 나눠줌
      ↓ 분배
[Worker PC 여러 대] ← 동시에 렌더링
      ↓ 저장
[NAS] ← 결과물이 여기에 모임
```

### 1-2. 사용 가능한 환경

| 구분 | 내용 |
| --- | --- |
| 실습실 | M211 |
| 지원 소프트웨어 | **Maya 2026**, Blender |
| 렌더러 | Arnold (Maya), Cycles/Eevee (Blender) |
| 서버 주소 | `223.194.101.83` |
| 작업 공간 | NAS 공유 폴더 `\\223.194.101.83\2026_renderfarm` |

> **Maya는 2026 버전을 사용한다.**
> 이 렌더팜의 Arnold 네트워크 라이선스는 2026 전용으로 발급되어 있다. 하위 버전(2023~2025)으로 제출해도 Worker는 Maya 2026으로 씬을 열어 렌더하므로 결과는 나오지만, 버전 차이로 인한 오류를 피하려면 처음부터 2026에서 작업하는 편이 안전하다.
>
> 구버전 씬을 2026에서 열면 "이 파일은 이전 버전에서 만들어졌습니다"라는 경고가 뜬다. 정상이며 무시해도 된다.

### 1-3. 처음 사용한다면

아래 세 가지를 먼저 준비한다.

1. **예약 시트 접근 권한** — 담당자에게 요청
2. **NAS 접근 권한** — 실습실 계정으로 접속 가능한지 확인
3. **학번 등록** — 예약 시트의 [사용자 관리] 시트에 본인 학번이 있는지 확인

---

## 2. 예약하기

렌더팜은 여러 명이 같이 쓰는 자원이다. 예약 없이 작업을 제출하면 다른 사람의 렌더와 충돌한다.

### 2-1. 예약 단위

**1블록 = 4시간**이며, 하루는 6블록으로 나뉜다.

| 블록 | 시간대 |
| --- | --- |
| 1 | 11:00 - 15:00 |
| 2 | 15:00 - 19:00 |
| 3 | 19:00 - 23:00 |
| 4 | 23:00 - 03:00 |
| 5 | 03:00 - 07:00 |
| 6 | 07:00 - 11:00 |

### 2-2. Worker 그룹 선택

같은 시간대라도 **렌더러별로 그룹이 나뉘어 있다.** 본인 작업에 맞는 그룹을 예약해야 한다.

| 그룹 | 용도 |
| --- | --- |
| Maya_Arnold_Parallel | Maya + Arnold, 프레임 분산 렌더 |
| Maya_Arnold_Serial | Maya + Arnold, 순차 렌더 (시뮬레이션 등 순서가 중요한 작업) |
| Blender_Parallel | Blender 렌더 |

> **Parallel vs Serial**
> Parallel은 프레임을 여러 Worker에 나눠 동시에 렌더한다. 대부분의 경우 이쪽이다.
> Serial은 한 대가 순서대로 렌더한다. 이전 프레임 결과가 다음 프레임에 영향을 주는 작업(파티클, 시뮬레이션 캐시 등)에 쓴다.

### 2-3. 예약 방법

1. 예약 시트를 연다
2. `[예약]` 시트에서 원하는 **시간 블록 행**과 **요일 열**이 만나는 칸을 찾는다
3. 본인이 쓸 **Worker 그룹** 행인지 확인한다
4. 빈 칸에 **본인 학번**을 입력한다

이미 학번이 적힌 칸은 다른 사람이 예약한 것이므로 건드리지 않는다.

### 2-4. 할당량 확인

라이선스 보유 수에 따라 주간 예약 가능 블록이 정해진다.

| 라이선스 | 주 최대 블록 | 환산 시간 |
| --- | --- | --- |
| 1개 | 12블록 | 48시간 |
| 2개 | 24블록 | 96시간 |

`[사용자 관리]` 시트에서 본인의 **남은 블록**을 확인할 수 있다. 할당량을 초과하면 예약이 자동으로 취소된다.

---

## 3. 파일 준비

**렌더 실패의 대부분은 경로 문제에서 생긴다.** 아래 규칙을 지키면 대부분 예방된다.

### 3-1. 모든 파일은 NAS에

씬 파일, 텍스처, 캐시, 레퍼런스 전부 NAS에 있어야 한다. Worker PC들은 내 PC의 로컬 디스크를 볼 수 없기 때문이다.

```
❌ 잘못된 예
C:\Users\홍길동\Desktop\myscene.ma
D:\project\textures\wood.jpg

✅ 올바른 예
\\서버주소\공유폴더\학번\프로젝트명\myscene.ma
\\서버주소\공유폴더\학번\프로젝트명\textures\wood.jpg
```

### 3-2. 폴더 구조

본인 학번 폴더 아래에 정리한다.

```
\\서버주소\공유폴더\
  └ 학번\
      └ 프로젝트명\
          ├ scenes\      ← 씬 파일
          ├ textures\    ← 텍스처
          ├ cache\       ← 시뮬레이션 캐시
          └ output\      ← 렌더 결과물
```

### 3-3. 경로 점검 체크리스트

제출 전에 확인한다.

- [ ] 씬 파일이 NAS에 저장되어 있는가
- [ ] 텍스처 경로가 전부 NAS를 가리키는가 (절대경로 권장)
- [ ] 캐시 파일이 NAS에 있는가
- [ ] Output 경로가 NAS로 설정되어 있는가
- [ ] 드라이브 문자(`Z:\`)가 아닌 UNC 경로(`\\서버주소\...`)를 쓰고 있는가

> **왜 드라이브 문자를 쓰면 안 되나**
> 내 PC에서 `Z:` 드라이브가 NAS를 가리켜도, Worker PC에서는 `Z:`가 다른 곳이거나 아예 없을 수 있다. UNC 경로는 모든 PC에서 같은 위치를 가리킨다.

### 3-4. Maya 경로 점검 도구

Maya에서 텍스처 경로를 한 번에 확인하려면,

```
Windows 메뉴 → General Editors → File Path Editor
```

여기서 로컬 경로를 쓰는 파일을 찾아 NAS 경로로 바꾼다.

---

### 3-5. 다른 사람에게 파일을 받을 때 — Archive Scene

씬 파일(.mb/.ma) 하나만 주고받으면 **텍스처와 레퍼런스가 전부 빠진다.** 씬에는 파일 자체가 아니라 "그 파일이 있던 경로"만 적혀 있기 때문이다. 보낸 사람 PC의 `D:\Projects\...` 같은 경로가 그대로 들어 있고, 받은 쪽에는 그런 경로가 없다.

더 나쁜 것은 **이 상태로도 렌더가 그냥 돈다**는 점이다. 텍스처 없이 회색으로, 레퍼런스 없이 캐릭터가 빠진 채로 완료된다. 결과물만 보고는 무엇이 빠졌는지 알기 어렵다.

**보내는 쪽이 할 일**

```
Maya에서  File → Archive Scene
```

씬이 참조하는 텍스처·레퍼런스·캐시가 전부 zip으로 묶인다. 이 zip을 보낸다.

**받는 쪽이 확인할 일**

씬을 연 뒤 **Windows → General Editors → File Path Editor** 에서 빨간 줄(못 찾는 파일)이 없는지 본다. 있으면 전부 선택해 NAS 경로로 Repath 한다.

렌더 로그에서도 사후 확인할 수 있다.

```
Warning: Reference file not found. : D:/...
WARNING | [texturesys] unable to load an image from the path: "D:/..."
```

---

## 4. 렌더 제출 — Maya

### 4-1. 제출 절차

1. 씬 파일을 **NAS에 저장**한다
2. 상단 메뉴에서 `Deadline → Submit Job To Deadline` 선택
3. 제출 창에서 아래 항목을 설정한다

| 항목 | 설정값 |
| --- | --- |
| Job Name | 알아보기 쉬운 이름 (예: `학번_프로젝트_v01`) |
| Comment | 선택 사항 |
| Department | 비워둬도 무방 |
| Pool | 담당자 안내에 따름 |
| Group | 예약한 그룹 (예: `arnold_parallel`) |
| Priority | 기본값 유지 |
| Frame List | 렌더할 프레임 범위 (예: `1-240`) |
| Frames Per Task | 분산 단위 (보통 1) |
| Renderer | Arnold |
| Output Path | NAS 경로 |

4. `Submit Job` 클릭

### 4-2. Frames Per Task 이해하기

이 값은 **Worker 한 대가 한 번에 맡을 프레임 수**다.

| 설정 | 동작 | 적합한 경우 |
| --- | --- | --- |
| 1 | 프레임 1개씩 분배 | 일반적인 경우 (권장) |
| 5~10 | 여러 프레임 묶어서 분배 | 프레임당 렌더가 매우 짧을 때 |

프레임당 렌더 시간이 짧은데 1로 두면, 작업을 분배하는 시간이 렌더 시간보다 길어져 오히려 비효율적이다.

---

### 4-3. Render Device는 CPU로

**Render Settings → Arnold Renderer → System → Render Device → `CPU`**

Arnold는 GPU 렌더링도 지원하지만, **공용 렌더팜에서는 CPU로 제출한다.**

GPU 모드는 Worker의 VRAM이 비어 있어야 동작한다. 다른 작업이 그래픽카드를 쓰고 있으면 Arnold는 CPU로 넘어가지 않고 **그 프레임만 실패시킨다.**

```
WARNING | [gpu] device selection failed. No matching device(s) have
          free memory greater than options.gpu_default_min_memory_MB threshold
ERROR   | [gpu] no GPU matching requirements found for GPU-rendering
Error: RuntimeError: [mtoa] Failed batch render
```

같은 작업이라도 어느 PC에 배정되느냐에 따라 결과가 갈린다. 240프레임 중 몇 장만 조용히 빠지는 형태로 나타나므로 발견이 늦다.

Worker는 20코어 CPU와 64GB 메모리를 갖고 있어 CPU 렌더로도 충분하며, 무엇보다 **결과가 PC 상태에 좌우되지 않는다.**

---

## 5. 렌더 제출 — Blender

### 5-1. 제출 절차

1. `.blend` 파일을 **NAS에 저장**한다
2. 외부 파일을 쓴다면 `File → External Data → Pack Resources`로 묶거나, 전부 NAS 경로로 지정한다
3. Deadline 플러그인이 설치되어 있다면 Blender에서 직접 제출한다
4. 플러그인이 없다면 **Deadline Monitor에서 직접 제출**한다

### 5-2. Monitor에서 직접 제출하기

```
Deadline Monitor 실행
  → 상단 메뉴 Submit
  → 3D → Blender
  → Blender 파일 선택
  → Frame Range, Output 경로 입력
  → Group을 blender_parallel로 설정
  → Submit
```

### 5-3. Blender 주의사항

- **Output 경로 끝에 `#` 기호**를 넣어야 프레임 번호가 붙는다 (예: `render_####.png`)
- Cycles는 CPU/GPU 설정이 Worker PC 환경과 맞아야 한다
- 애드온을 쓴다면 Worker PC에도 같은 애드온이 설치되어 있어야 한다

---

## 6. 진행 확인 및 결과물 수령

### 6-1. Deadline Monitor에서 확인

Monitor의 **Jobs 패널**에서 본인 작업 상태를 볼 수 있다.

| 상태 | 의미 |
| --- | --- |
| Queued | 대기 중 — 아직 Worker에 배정되지 않음 |
| Rendering | 렌더 진행 중 |
| Completed | 완료 |
| Failed | 실패 — 로그 확인 필요 |
| Suspended | 일시정지 |

### 6-2. 실패했을 때

해당 Job을 우클릭 → `View Job Reports`에서 로그를 확인한다. 로그 하단에 오류 원인이 기록되어 있다.

흔한 원인은 7장을 참고한다.

### 6-3. 결과물 받기

렌더가 완료되면 제출할 때 지정한 **Output 경로(NAS)** 에 이미지가 저장되어 있다. 본인 PC로 복사해 가면 된다.

> 작업이 끝나면 NAS에서 불필요한 캐시 파일을 정리한다. 용량이 차면 다른 사람이 쓸 수 없다.

---

## 7. 자주 발생하는 문제

### 7-1. 텍스처가 안 나온다 / 회색으로 렌더된다

**원인**: 텍스처 경로가 로컬 디스크를 가리킴

**해결**: File Path Editor(Maya)에서 모든 텍스처를 NAS 절대경로로 변경 후 재제출

---

### 7-2. 결과물에 워터마크가 찍힌다

**원인**: Arnold 라이선스를 받지 못한 상태로 렌더됨

**해결**: 담당자에게 문의한다. 라이선스 서버(M211-00) 전원이 꺼져 있거나, Worker PC의 라이선스 환경변수가 재부팅으로 초기화된 경우다.

> 운영자는 Arnold Render Settings의 `Abort on License Fail`을 켜둔 상태로 운영한다. 켜져 있으면 라이선스를 못 받았을 때 워터마크 이미지를 만들지 않고 렌더를 중단하므로, 쓸 수 없는 결과물이 조용히 쌓이는 것을 막는다.

---

### 7-3. Job이 Queued에서 안 넘어간다

**원인 후보**

| 가능성 | 확인 방법 |
| --- | --- |
| 예약한 그룹에 Worker가 없음 | Monitor의 Workers 패널에서 Online 여부 확인 |
| 해당 그룹을 다른 사람이 점유 중 | Jobs 패널에서 다른 Job 진행 여부 확인 |
| Group 이름을 잘못 입력 | 제출 설정 재확인 |

---

### 7-4. 일부 프레임만 렌더된다

**원인**: 중간 프레임에서 오류 발생

**해결**: Job 우클릭 → `Resume Failed Tasks`로 실패한 프레임만 다시 돌린다

---

### 7-5. 캐시가 안 읽힌다

**원인**: 캐시 파일이 로컬에 있거나 상대경로로 지정됨

**해결**: 캐시를 NAS로 옮기고 씬에서 경로를 다시 지정한 뒤 저장

---

### 7-6. 일부 프레임만 실패하고 Job은 Completed

**원인 1 — GPU 메모리 부족**

로그에 `[gpu] no GPU matching requirements found` 가 있으면 그 Worker의 VRAM이 부족했던 것이다. Render Device를 CPU로 바꿔 재제출한다 (4-3 참조).

**원인 2 — 그 외**

해당 Task 우클릭 → `View Task Report` 로 원인을 확인한 뒤, Job 우클릭 → `Resume Failed Tasks`.

> Job이 Completed여도 결과물 장수를 반드시 세어볼 것. Deadline은 렌더가 중단돼도 Completed로 표시하는 경우가 있다.

---

## 8. 운영 규칙

### 8-1. 지켜야 할 것

| 항목 | 규칙 |
| --- | --- |
| 예약 | 반드시 사전 예약 후 사용 |
| 할당량 | 주간 배정 블록 내에서만 예약 |
| 타인 예약 | 수정·삭제 금지 |
| 미사용 | 예약 시작 후 30분간 제출이 없으면 자동 해제 |
| 파일 정리 | 작업 완료 후 캐시 등 불필요한 파일 삭제 |
| 장시간 작업 | 블록을 넘길 것으로 예상되면 미리 연속 예약 |

### 8-2. 페널티

위반 1회당 다음 주 예약 가능 블록에서 4블록이 차감된다.

- 타인 예약 무단 수정·삭제
- 예약 없이 작업 제출
- 할당량 초과 예약

---

# 2부 — 운영자 가이드

## 9. 시스템 구조

### 9-1. 전체 구성

```
                    [NAS]
                      ↕
                  [main PC]
                      ↓
      ┌───────┬───────┼───────┬───────┐
      ↓       ↓       ↓       ↓
  Arnold   Arnold   Blender
 Parallel  Serial  Parallel Parallel
  (W×5)    (W×5)    (W×5)    (W×5)
```

| 구성 요소 | 역할 |
| --- | --- |
| NAS | 씬 파일, 텍스처, 캐시, 결과물 저장 |
| main PC | Deadline Repository, MongoDB, 라이선스 서버 |
| Worker | 실제 렌더링 수행 노드 |

### 9-2. 핵심 소프트웨어

| 분류 | 소프트웨어 | 역할 |
| --- | --- | --- |
| 렌더 관리 | Thinkbox Deadline 10 | Job 분배 및 Worker 관리 |
| 데이터베이스 | MongoDB | Job 상태 및 Worker 정보 저장 |
| 라이선스 | Autodesk Network License Manager (FlexLM) | Arnold 네트워크 라이선스 배분 (포트 27000) |
| 예약 | Google Sheets + GAS | 사용자 예약 및 할당량 관리 |

### 9-3. 라이선스 구조

라이선스 서버는 **M211-00** 한 대에 집중되어 있다.

| 라이선스 매니저 | 포트 | 제품 | 비고 |
| --- | --- | --- | --- |
| Autodesk FlexLM (`lmgrd` + `adskflex`) | **27000** | Arnold | 실제로 쓰는 것 |
| Foundry RLM (`rlm.foundry`) | 5053 | Nuke | Arnold와 무관 |

**발급된 Arnold feature는 `88169ARNOL_2026_0F` 하나뿐이다.**

- 좌석 3,000석 / 만료 2027-06-25
- 라이선스 파일: `C:\Autodesk\Network License Manager\Licenses\ARNOL2026kolicense.lic`
- **2026 전용**이다. Maya 2025 + MtoA 5.4.5는 `ARNOL_2025_0F`를 요청하므로 `[clm.v1] generic license checkout error (22)`로 실패한다.

> **주의 1 — M211-00은 항상 켜져 있어야 한다.**
> 이 PC가 꺼지면 전체 팜의 Arnold 렌더가 전부 실패한다. Deadline Worker 목록에서 M211-00이 Offline으로 보여도 상관없다. Worker로서 꺼져 있을 뿐 라이선스 서버 역할은 별개다.
>
> **주의 2 — `solidangle_LICENSE = 5053@M211-00` 설정은 잘못된 것이다.**
> 5053은 Nuke용 Foundry RLM이며 Arnold 라이선스를 갖고 있지 않다. Arnold는 FlexLM(27000)을 봐야 한다. 구축 과정에서 두 제품이 모두 RLM 계열이라는 점 때문에 생긴 혼선이었다.

**라이선스 상태 확인** (M211-00에서 실행)

```powershell
cd "C:\Autodesk\Network License Manager"
.\lmutil lmstat -a -c 27000@localhost
```

`88169ARNOL_2026_0F` 항목과 사용 좌석 수가 보이면 정상이다.

---

## 10. 예약 시트 구축

### 10-1. 시트 업로드

제공된 템플릿(`renderfarm_booking_template.xlsx`)을 Google Sheets로 올린다.

```
Google Drive → 새로 만들기 → 파일 업로드
  → 업로드된 파일 우클릭
  → 연결 프로그램 → Google 스프레드시트
```

### 10-2. 시트 구성

| 시트 | 내용 |
| --- | --- |
| 예약 | 요일 × 시간블록 × Worker그룹 예약 그리드 |
| 사용자 관리 | 학번별 라이선스 수와 잔여 블록 (수식 자동 계산) |
| 사용 안내 | 학생용 요약 규칙 |

`[사용자 관리]` 시트의 **사용한 블록**과 **남은 블록**은 `COUNTIF` 수식으로 자동 계산되므로 직접 입력하지 않는다.

### 10-3. 공유 설정

| 대상 | 권한 |
| --- | --- |
| 학생 | 편집자 (예약 입력 필요) |
| 담당자 | 편집자 |

> 학생에게 편집 권한을 주어야 예약이 가능하지만, 그만큼 타인 예약을 건드릴 위험도 생긴다. 다음 장의 GAS를 적용하면 변경 이력이 자동 기록된다.

---

## 11. GAS 자동화

### 11-1. 적용 방법

```
스프레드시트 상단 메뉴
  → 확장 프로그램 → Apps Script
  → 아래 코드 붙여넣기 → 저장
```

저장 후 스프레드시트를 새로고침하면 상단에 `렌더팜` 메뉴가 생긴다.

### 11-2. 전체 코드

```javascript
// ───────────────────────────────────────────────
// M211 렌더팜 예약 시트 자동화
// ───────────────────────────────────────────────

const SHEET_BOOKING = '예약';
const SHEET_USERS   = '사용자 관리';
const SHEET_LOG     = '변경로그';

const FIRST_ROW = 4;   // 예약 그리드 시작 행
const LAST_ROW  = 27;  // 예약 그리드 끝 행
const FIRST_COL = 3;   // C열 (월)
const LAST_COL  = 9;   // I열 (일)


// 시트 열릴 때 메뉴 추가
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('렌더팜')
    .addItem('주간 예약 초기화', 'resetWeek')
    .addItem('예약 현황 요약', 'showSummary')
    .addToUi();
}


// 셀 수정 시 검증
function onEdit(e) {
  const sh = e.range.getSheet();
  if (sh.getName() !== SHEET_BOOKING) return;

  const r = e.range.getRow();
  const c = e.range.getColumn();
  if (r < FIRST_ROW || r > LAST_ROW) return;
  if (c < FIRST_COL || c > LAST_COL) return;

  const newVal = (e.value    || '').toString().trim();
  const oldVal = (e.oldValue || '').toString().trim();

  writeLog(e.range.getA1Notation(), oldVal, newVal);

  if (newVal === '') return;  // 예약 취소는 통과

  // 1) 등록된 학번인지 확인
  if (getQuota(newVal) === null) {
    e.range.setValue(oldVal);
    SpreadsheetApp.getActiveSpreadsheet()
      .toast('등록되지 않은 학번입니다: ' + newVal, '예약 거부', 5);
    return;
  }

  // 2) 할당량 초과 여부
  const used  = countBookings(newVal);
  const quota = getQuota(newVal);
  if (used > quota) {
    e.range.setValue(oldVal);
    SpreadsheetApp.getActiveSpreadsheet()
      .toast(newVal + ' 주간 할당량(' + quota + '블록) 초과', '예약 거부', 5);
  }
}


// 학번의 주간 할당량 조회 (미등록이면 null)
function getQuota(studentId) {
  const sh = SpreadsheetApp.getActiveSpreadsheet()
                           .getSheetByName(SHEET_USERS);
  const data = sh.getRange(4, 1, 30, 3).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0].toString().trim() === studentId) {
      return Number(data[i][2]) || 0;
    }
  }
  return null;
}


// 예약 그리드에서 해당 학번 개수 세기
function countBookings(studentId) {
  const sh = SpreadsheetApp.getActiveSpreadsheet()
                           .getSheetByName(SHEET_BOOKING);
  const values = sh.getRange(
    FIRST_ROW, FIRST_COL,
    LAST_ROW - FIRST_ROW + 1,
    LAST_COL  - FIRST_COL + 1
  ).getValues();

  let count = 0;
  values.forEach(function (row) {
    row.forEach(function (cell) {
      if (cell.toString().trim() === studentId) count++;
    });
  });
  return count;
}


// 변경 이력 기록
function writeLog(cellRef, oldVal, newVal) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_LOG);

  if (!sh) {
    sh = ss.insertSheet(SHEET_LOG);
    sh.appendRow(['시각', '편집자', '셀', '이전 값', '변경 값']);
    sh.getRange(1, 1, 1, 5).setFontWeight('bold');
  }

  let editor = '';
  try { editor = Session.getActiveUser().getEmail(); } catch (err) {}

  sh.appendRow([
    new Date(),
    editor,
    cellRef,
    oldVal,
    newVal
  ]);
}


// 주간 예약 초기화
function resetWeek() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.alert(
    '주간 예약 초기화',
    '예약 시트의 모든 예약을 지웁니다. 계속하시겠습니까?',
    ui.ButtonSet.YES_NO
  );
  if (res !== ui.Button.YES) return;

  SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(SHEET_BOOKING)
    .getRange(
      FIRST_ROW, FIRST_COL,
      LAST_ROW - FIRST_ROW + 1,
      LAST_COL  - FIRST_COL + 1
    ).clearContent();

  ui.alert('초기화가 완료되었습니다.');
}


// 예약 현황 요약
function showSummary() {
  const sh = SpreadsheetApp.getActiveSpreadsheet()
                           .getSheetByName(SHEET_BOOKING);
  const values = sh.getRange(
    FIRST_ROW, FIRST_COL,
    LAST_ROW - FIRST_ROW + 1,
    LAST_COL  - FIRST_COL + 1
  ).getValues();

  const counts = {};
  let total = 0, filled = 0;

  values.forEach(function (row) {
    row.forEach(function (cell) {
      total++;
      const v = cell.toString().trim();
      if (v !== '') {
        filled++;
        counts[v] = (counts[v] || 0) + 1;
      }
    });
  });

  let msg = '전체 ' + total + '블록 중 ' + filled + '블록 예약됨\n'
          + '점유율 ' + Math.round(filled / total * 100) + '%\n\n';

  Object.keys(counts).sort().forEach(function (k) {
    msg += k + ' : ' + counts[k] + '블록\n';
  });

  SpreadsheetApp.getUi().alert('예약 현황', msg,
    SpreadsheetApp.getUi().ButtonSet.OK);
}
```

### 11-3. 동작 요약

| 기능 | 설명 |
| --- | --- |
| 미등록 학번 차단 | `[사용자 관리]`에 없는 학번은 입력 거부 |
| 할당량 초과 차단 | 주간 배정 블록을 넘으면 자동 되돌림 |
| 변경 이력 기록 | `[변경로그]` 시트에 누가 언제 무엇을 바꿨는지 자동 기록 |
| 주간 초기화 | 메뉴에서 한 번에 예약 비우기 |
| 현황 요약 | 점유율과 학번별 예약 블록 수 확인 |

### 11-4. 행 범위 조정

예약 그리드의 행 수를 바꿨다면 코드 상단의 `LAST_ROW` 값을 실제 마지막 행 번호로 수정한다.

---

## 12. Worker 그룹 관리

### 12-1. 그룹 확인

```
Deadline Monitor
  → Workers 패널
  → Worker 우클릭 → Modify Worker Properties
  → Groups 탭에서 소속 그룹 확인
```

### 12-2. 그룹 변경

렌더러 구성이 바뀌면 그룹을 재배치한다. 예약 시트의 Worker 그룹 행 이름도 함께 수정해야 한다.

### 12-3. Worker 상태

| 상태 | 의미 | 조치 |
| --- | --- | --- |
| Idle | 대기 중 (정상) | — |
| Rendering | 렌더 중 (정상) | — |
| Offline | 연결 끊김 | PC 전원 및 네트워크 확인 |
| Stalled | 응답 없음 | 우클릭 → Mark as Idle |

---

## 13. 장애 대응

### 13-1. Worker가 전부 Offline

| 확인 순서 | 명령 / 방법 |
| --- | --- |
| 1. 서버 생존 | `ping 223.194.101.83` |
| 2. Repository 접근 | `dir \\223.194.101.83\deadline_repo` |
| 3. MongoDB 상태 | `Get-Service MongoDB` |
| 4. Worker PC 전원 | 실습실 직접 확인 |

### 13-2. Repository 연결 실패

실습실 PC는 복원 솔루션(Deep Freeze / 넷클래스)으로 인해 재부팅 시 설정이 초기화될 수 있다.

**설정 파일 위치**

```
C:\ProgramData\Thinkbox\Deadline10\connection.ini
```

**복구 내용**

```
StoragePath=\\223.194.101.83\deadline_repo
DatabaseServer=223.194.101.83:27017
```

### 13-3. 라이선스 오류

증상별 원인은 아래와 같다.

| 로그 메시지 | 원인 |
| --- | --- |
| `[clm.v1] generic license checkout error (22)` | 요청한 연도의 feature가 없음 — Maya 2025로 돌린 경우 |
| `rendering with watermarks because of failed authorization` | 라이선스 서버에 닿지 못함 |
| `[network] authorized for "88169ARNOL_2026_0F"` | **정상** |

**진단** (Worker PC에서 실행)

```powershell
# 환경변수 확인
[System.Environment]::GetEnvironmentVariable("ADSKFLEX_LICENSE_FILE", "Machine")

# 라이선스 서버 연결 확인 (Arnold는 27000)
Test-NetConnection M211-00 -Port 27000
```

`TcpTestSucceeded : True`가 나와야 한다. `PingSucceeded`만 True이고 Tcp가 False면 M211-00은 켜져 있으나 라이선스 서비스가 안 돌고 있는 것이다. M211-00에서 서비스 `Arnold License`를 재시작한다.

값이 비어 있으면 13-4의 복구 스크립트를 실행한다.

### 13-4. 재부팅 후 설정 유실 대응

복원 솔루션이 적용된 PC에서는 매번 설정이 날아간다. 복구 스크립트를 NAS에 두고 실습 시작 시 실행하는 방식을 권장한다.

```batch
@echo off
REM Worker 환경 복구

net use Z: \\서버주소\공유폴더 /persistent:no

setx ADSKFLEX_LICENSE_FILE "@M211-00" /M
setx MAYA_LICENSE_METHOD "network" /M

"C:\Program Files\Thinkbox\Deadline10\bin\deadlinecommand.exe" ^
  ChangeRepository Direct \\223.194.101.83\deadline_repo

echo 복구 완료
pause
```

---

## 14. MayaBatch 플러그인 설정 및 필수 패치

이 장의 두 가지는 **렌더팜을 재설치하거나 Repository를 복원하면 사라진다.** 그 경우 Maya 렌더가 전부 실패하므로 가장 먼저 다시 적용해야 한다.

### 14-1. 실행 파일 경로 — 전 버전을 Maya 2026으로

```
Deadline Monitor
  → Tools → Configure Plugins → MayaBatch
```

아래 네 칸을 **모두 같은 값**으로 지정한다.

| 설정 항목 | 값 |
| --- | --- |
| Maya 2023 Render Executable | `C:\Program Files\Autodesk\Maya2026\bin\MayaBatch.exe` |
| Maya 2024 Render Executable | `C:\Program Files\Autodesk\Maya2026\bin\MayaBatch.exe` |
| Maya 2025 Render Executable | `C:\Program Files\Autodesk\Maya2026\bin\MayaBatch.exe` |
| Maya 2026 Render Executable | `C:\Program Files\Autodesk\Maya2026\bin\MayaBatch.exe` |

**왜 이렇게 하는가.** Deadline은 씬이 저장된 Maya 버전을 보고 해당 버전 칸의 실행 파일을 찾는다. 그런데 이 팜의 Arnold 라이선스는 2026 전용이므로(9-3 참조), 2025 칸에 Maya 2025를 정직하게 넣으면 그 씬은 라이선스를 받지 못해 반드시 실패한다. 전 버전을 2026으로 보내면 어떤 버전의 씬이 들어와도 렌더된다.

> 로그에 `Rendering with Maya Version 2025.0`이라고 찍히면서 `Executable: ...Maya2026\bin\MayaBatch.exe`가 나오는 것은 **정상**이다. 앞의 숫자는 씬의 버전, 뒤가 실제 실행 파일이다.

### 14-2. OCIO 경로 패치 (필수)

**증상.** 라이선스도 정상이고 씬도 정상인데, 렌더가 0.3초 만에 끝나고 결과물이 없다. Job은 Completed로 표시된다.

```
ERROR | [color_manager_ocio] could not read
        '<MAYA_RESOURCES>/OCIO-configs/Maya-legacy/config.ocio' OCIO profile.
WARNING | Aborted by user: received abort signal
Error: RuntimeError: [mtoa] Failed batch render
```

**원인.** Maya 제출기가 색 관리 설정 경로를 `<MAYA_RESOURCES>` 토큰이 들어간 문자열로 보낸다. 이 토큰은 Maya 내부에서만 치환되는 것이라 OS 환경변수로는 해석되지 않는다. Deadline 플러그인이 그 문자열을 그대로 환경변수 `OCIO`에 넣으면서 Arnold가 설정 파일을 읽지 못하고 중단된다.

**적용 방법.** 아래 파일의 322번째 줄을 수정한다.

```
\\223.194.101.83\deadline_repo\plugins\MayaBatch\MayaBatch.py
```

수정 전

```python
elif ocioConfig:
    self.SetEnvironmentAndLogInfo("OCIO", RepositoryUtils.CheckPathMapping( ocioConfig ))
```

수정 후

```python
elif ocioConfig:
    self.SetEnvironmentAndLogInfo("OCIO", RepositoryUtils.CheckPathMapping( ocioConfig ).replace("<MAYA_RESOURCES>", "C:/Program Files/Autodesk/Maya2026/resources"))
```

PowerShell로 한 번에 적용하려면 (백업 자동 생성)

```powershell
$f = "\\223.194.101.83\deadline_repo\plugins\MayaBatch\MayaBatch.py"
Copy-Item $f "$f.bak"
$t = [IO.File]::ReadAllText($f)
$t = $t.Replace('CheckPathMapping( ocioConfig ))', 'CheckPathMapping( ocioConfig ).replace("<MAYA_RESOURCES>", "C:/Program Files/Autodesk/Maya2026/resources"))')
[IO.File]::WriteAllText($f, $t, (New-Object Text.UTF8Encoding $false))
findstr /n "MAYA_RESOURCES" $f
```

마지막 줄에서 `322:`로 시작하는 결과가 나오면 적용된 것이다.

### 14-3. 플러그인 수정의 검증 — Requeue가 아니라 신규 제출

**Requeue로는 수정이 반영되지 않는다.** Worker는 Repository의 플러그인을 Job ID별 폴더에 복사해 캐시한다.

```
C:\ProgramData\Thinkbox\Deadline10\workers\<Worker명>\plugins\<JobID>\MayaBatch.py
```

같은 Job을 Requeue하면 Job ID가 그대로이므로 **캐시된 옛 플러그인이 다시 실행된다.** 플러그인을 고친 뒤에는 반드시 **새 Job으로 제출**해야 Repository에서 새로 복사해 간다.

### 14-4. 정상 동작 확인 체크리스트

새 Job의 Task 로그에서 아래 네 줄을 확인한다.

```
[1] Setting Process Environment Variable OCIO to C:/Program Files/Autodesk/Maya2026/resources/...
        → <MAYA_RESOURCES>가 아닌 실제 경로여야 한다

[2] [network] authorized for "88169ARNOL_2026_0F"
        → 라이선스 정상

[3] 1% done … 100% done
        → 실제로 렌더되고 있다는 유일한 증거

[4] [driver_png] writing file '//223.194.101.83/2026_renderfarm/output/...'
        → NAS에 기록됨
```

> **Completed 표시를 믿지 말 것.** Deadline의 strict error checking이 mtoa 오류를 "unrecognized error"로 무시하기 때문에, 실패한 렌더도 100% Completed로 표시된다. 판별 기준은 Task Time(수 초 이내면 의심), 평균 CPU 사용률(1%면 렌더 안 한 것), 그리고 로그의 `% done` 유무다.

---

## 부록 — 빠른 참조

### 학생용 체크리스트

```
[ ] 예약 시트에서 시간 블록 예약
[ ] 씬 파일을 NAS에 저장
[ ] 텍스처·캐시 경로를 NAS 절대경로로 변경 (File Path Editor에 빨간 줄 없음)
[ ] Output 경로를 NAS로 설정
[ ] Arnold Render Device = CPU
[ ] Deadline으로 제출 (Group은 예약한 그룹)
[ ] Monitor에서 진행 확인
[ ] 완료 후 결과물 수령 및 캐시 정리
```

### 주요 경로

| 항목 | 경로 |
| --- | --- |
| Deadline Repository | `\\223.194.101.83\deadline_repo` |
| Worker 설정 파일 | `C:\ProgramData\Thinkbox\Deadline10\connection.ini` |
| MongoDB 포트 | `27017` |
| Arnold 라이선스 서버 | `27000@M211-00` (FlexLM) |
| NAS 작업 폴더 | `\\223.194.101.83\2026_renderfarm` |

> NAS 작업 폴더 경로와 예약 시트 주소는 실제 운영 환경에 맞게 기입하여 배포한다.
