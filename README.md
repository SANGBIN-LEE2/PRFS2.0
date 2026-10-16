# 🎬 PRFS 2.0 — Phoenix Render Farm System

> 홍익대학교 영상애니메이션학부 졸업작품 프로젝트
> 담당: 이상빈 (영상애니메이션학부 4학년 / 컴퓨터공학 복수전공)
> 지도교수: 송정진

실습실 PC를 묶어 **학생이 실제로 사용할 수 있는 렌더팜**을 구축하고 운영하는 프로젝트다.

---

## 📌 현재 상태 (2026.10.17)

**M211 Maya/Arnold 렌더팜이 동작한다.** Maya → Deadline → Worker 20대 → NAS 출력의 전 구간이 검증됐다.

| 검증 항목 | 결과 |
| --- | --- |
| 분산 렌더 | 10프레임 → Worker 10대 자동 배분, NAS 출력 성공 |
| 외부 프로덕션 씬 | 폴리곤 50만 / 조명 4개 샷 렌더 성공 |
| 예약 시스템 | Google Sheets + GAS — 졸업준비위원회 인계 완료 |
| 문서 | 학생용 4p 가이드 + 운영매뉴얼 29p |

다음 단계는 학생 배포와 시범 운영이다.

---

## 🏗️ 구성

### M211 — Maya / Arnold (운영 준비 완료)

```
NAS (223.194.101.83)
├── deadline_repo/          Deadline Repository + MongoDB
└── 2026_renderfarm/        학생 작업 영역 (별도 볼륨)

M211-00                     라이선스 서버
├── Autodesk FlexLM         포트 27000 — Arnold
└── Foundry RLM             포트 5053 — Nuke

M211-01 ~ M211-19           Worker (20대)
├── Deadline Worker
├── Maya 2026 + MtoA 5.5.3
└── Blender
```

| 분류 | 기술 |
| --- | --- |
| 렌더 관리 | Thinkbox Deadline 10.4.2.2 |
| 3D | Maya 2026, Blender |
| 렌더러 | Arnold 7.4.2.2, Cycles/Eevee |
| 라이선스 | Autodesk Network License Manager (FlexLM) |
| 스토리지 | Synology NAS |
| 예약 | Google Sheets + Apps Script |

### T104 — Cinema 4D (구축 단계)

T동 실습실에 C4D 전용 독립 렌더팜을 구축하는 작업. 서버 PC 1대 + Worker 6대 구성이며, 상세 내용은 [`docs/architecture.md`](docs/architecture.md)와 [`docs/setup-guide.md`](docs/setup-guide.md)에 있다.

---

## 📁 파일 구조

```
PRFS2.0/
├── docs/
│   ├── m211/
│   │   ├── operations-manual.md        M211 운영 매뉴얼 (본문)
│   │   └── nas-structure.md            NAS 디렉토리 설계
│   ├── troubleshooting/
│   │   └── 2026-10_m211-render-pipeline.md
│   ├── pdf/                            배포용 PDF
│   ├── architecture.md                 T104 시스템 구조
│   ├── setup-guide.md                  T104 설치 가이드
│   ├── blender_deadline_setup_3.md
│   └── 2026-07-28_troubleshooting.md
│
├── patches/
│   └── MayaBatch-ocio.md               ⚠️ 재설치 시 필수 재적용
│
├── scripts/
│   ├── m211/                           NAS 생성·학생용·Worker 복구 .bat
│   ├── set_arnold_license.bat
│   └── set_arnold_license_maya.bat
│
├── reservation/
│   ├── m211_booking.gs                 M211 예약 시스템 (현행)
│   ├── m211_booking_template.xlsx      예약 시트 템플릿
│   └── reservation_system.gs           초기 버전
│
├── nas-template/
│   └── 00_READ_ME_FIRST/               학생 안내문 원본
│
└── reports/
    └── 2026-W07.md                     주간 진행 보고
```

---

## ⚠️ 재설치 시 반드시 다시 적용할 것

Repository를 재설치하거나 복원하면 아래 두 가지가 사라진다. **이 설정이 없으면 Maya 렌더가 전부 실패한다.**

1. **MayaBatch 플러그인 OCIO 패치** → [`patches/MayaBatch-ocio.md`](patches/MayaBatch-ocio.md)
2. **플러그인 실행 경로** — Maya 2023/2024/2025/2026 전부 Maya2026 경로로 지정

두 번째가 필요한 이유는 이 팜의 Arnold 라이선스가 **2026 전용 feature 하나뿐**이기 때문이다. 자세한 배경은 [트러블슈팅 문서](docs/troubleshooting/2026-10_m211-render-pipeline.md)에 있다.

---

## 📋 주요 트러블슈팅

| 문제 | 원인 | 해결 |
| --- | --- | --- |
| 렌더가 0.3초 만에 중단 | `<MAYA_RESOURCES>` 토큰이 환경변수로 전달됨 | MayaBatch.py 패치 |
| 실패한 렌더가 Completed로 표시 | Strict error checking이 오류 무시 | 결과물 수량으로 교차 검증 |
| Arnold 라이선스 인증 실패 | 2026 전용 feature만 발급됨 | 전 버전 Maya 2026으로 통일 |
| 일부 프레임만 실패 | Worker VRAM 부족 — CPU 폴백 없음 | Render Device를 CPU로 고정 |
| 받은 씬이 회색으로 렌더됨 | 텍스처·레퍼런스 경로 유실 | Archive Scene으로 주고받기 |
| T동↔M동 연결 실패 | 4433 포트 방화벽 차단 | T동 독립 렌더팜으로 전환 |
| MongoDB 외부 접근 불가 | `bindIp: 127.0.0.1` | `bindIp: 0.0.0.0` |

전체 기록은 [`docs/troubleshooting/`](docs/troubleshooting/)에 있다.

---

## 📅 진행 경과

| 시기 | 내용 |
| --- | --- |
| 2026.03 | 프로젝트 시작, 기존 렌더팜 구조 분석, NAS 접속 |
| 2026.03.28 | T동↔M동 방화벽 차단 확인 → 독립 구축으로 전환 |
| 2026.04 ~ 07 | T동 서버 PC MongoDB + Deadline Repository 구축 |
| 2026.07 | C4D 배치 렌더 테스트, 예약 시스템 1차 개발 |
| 2026.09 | 서버 재구축, RCS 전환, 최소 테스트 렌더 성공 |
| 2026.10 | **M211 NAS 구조 구축, 예약 시스템 인계, 매뉴얼 작성** |
| 2026.10.17 | **Maya→Deadline→NAS 전구간 검증 — 테스트 렌더 성공** |

---

## 📚 참고

- [Deadline 공식 문서](https://docs.thinkboxsoftware.com)
- [Arnold for Maya 문서](https://help.autodesk.com/view/ARNOL/ENU/)
- PRFS 1.0 — 강세영 선배 졸업논문 (Deadline 기반 렌더팜 구축 연구)
