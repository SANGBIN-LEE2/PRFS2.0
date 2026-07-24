[README.md](https://github.com/user-attachments/files/30334744/README.md)
# PRFS2.0

영상애니메이션 촬영스튜디오 T동 C4D 렌더팜 구축 프로젝트
# 🎬 PRFS 2.0 — T동 C4D 전용 렌더팜 구축 프로젝트

> Phoenix Render Farm System 2.0  
> 홍익대학교 영상애니메이션학부 졸업작품 프로젝트

---

## 📌 프로젝트 개요

홍익대학교 영상애니메이션 촬영스튜디오(T104호) 실습실 PC 6대와 서버 PC 1대를 활용하여  
**Cinema 4D(C4D) 전용 독립 렌더팜**을 구축하는 졸업작품 프로젝트입니다.

기존 M동(PRFS 1.0, 강세영 선배 구축)의 Maya/Blender 렌더팜과는 완전히 별개로 운영되며,  
T동 자체 Repository, MongoDB, Arnold 라이선스 서버, 스토리지를 갖춘 독립형 시스템입니다.

---

## 🏗️ 시스템 구조

```
T동 서버 PC (1대)
├── Deadline Repository
├── MongoDB 7.0
├── Arnold NLM 라이선스 서버
└── 로컬 스토리지 (NAS 역할)

T동 Worker PC (6대)
├── Deadline Worker
├── Cinema 4D + Redshift
└── Arnold 플러그인
```

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| 렌더 관리 | Deadline 10 |
| 데이터베이스 | MongoDB 7.0 |
| 3D 소프트웨어 | Cinema 4D |
| 렌더러 | Redshift |
| 라이선스 관리 | Arnold NLM |
| 예약 시스템 | Google Apps Script (JavaScript) |

---

## 📁 파일 구조

```
PRFS2.0/
├── README.md
└── reservation_system.gs   ← 렌더팜 예약 시스템 (Google Apps Script)
```

---

## 📋 예약 시스템 (`reservation_system.gs`)

Google Sheets + Google Apps Script 기반의 렌더팜 예약 자동화 시스템입니다.

### 주요 기능
- **M동(Blender) / T동(C4D)** 실습실 예약 시트 분리 관리
- **4타임제** 운영 (19~23 / 23~03 / 03~07 / 07~11)
- **중복 예약 자동 방지**
- **주간 최대 3블럭 제한** 자동 체크
- **본인 예약만 취소 가능** (학번 검증)
- **사용 로그 자동 기록**
- **관리자 메뉴** (현황 보기, 날짜 업데이트)

### 사용 방법

**1. Google Sheets 새로 만들기**

**2. Apps Script 열기**
```
상단 메뉴 → 확장 프로그램 → Apps Script
```

**3. 코드 붙여넣기**
- 기존 코드 전체 삭제 후 `reservation_system.gs` 내용 복붙
- Ctrl+S 저장

**4. 초기 설정 실행 (최초 1회)**
- 상단 드롭다운에서 `setupSheets` 선택
- ▶ 실행 버튼 클릭
- 권한 허용

**5. 완성된 시트 구조**
```
스프레드시트
├── M동_예약     ← Blender 사용자 예약
├── T동_예약     ← C4D 사용자 예약
├── 사용자목록   ← 학생 등록 관리
└── 사용로그     ← 전체 사용 기록
```

---

## 📅 개발 일지

| 날짜 | 내용 |
|------|------|
| 2026.03.16 | 프로젝트 시작, M동 렌더팜 구조 분석 |
| 2026.03.23 | NAS 접속, TLS 인증서 확보, C4D 설치 확인 |
| 2026.03.28 | T동↔M동 방화벽 차단 확인 → 독립 구축으로 방향 전환 |
| 2026.04.02 | T동 PC 1대 Deadline Worker 원격 설치 완료 |
| 2026.07.07 | T동 서버 PC MongoDB + Deadline Repository 설치 완료 |
| 2026.07.07 | C4D 배치 렌더 테스트 성공 (Redshift 모듈 로드 확인) |
| 2026.07.07 | Google Sheets 기반 예약 시스템 개발 |

---

## ⚠️ 주요 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| T동↔M동 연결 실패 | 4433 포트 방화벽 차단 | T동 독립 렌더팜으로 전환 |
| MongoDB 외부 접근 불가 | bindIp: 127.0.0.1 | bindIp: 0.0.0.0 으로 수정 |
| GAS 실행 시간 초과 | 셀 개별 처리 방식 | 일괄 처리 방식으로 최적화 |

---

## 🗓️ 전체 일정

| 단계 | 기간 | 상태 |
|------|------|------|
| 환경 분석 및 계획 | 03.16 ~ 03.20 | ✅ 완료 |
| 서버 접속 및 환경 구축 | 03.23 ~ 04.02 | ✅ 완료 |
| T동 서버/Worker 구축 | 04.06 ~ 07.07 | 🔄 진행중 |
| C4D 연동 및 테스트 | 07월 ~ 08월 | ⬜ 예정 |
| 안정화 및 프로젝트 종료 | 08월 | ⬜ 예정 |

---

## 👤 담당자

- **담당자:** 이상빈 (영상애니메이션학부 4학년)
- **목표 완료일:** 2026년 8월

---

## 📚 참고

- [PRFS 1.0 논문](강세영 선배 졸업논문) — Deadline 기반 렌더팜 구축 연구
- [Deadline 공식 문서](https://docs.thinkboxsoftware.com)
- [MongoDB 공식 문서](https://www.mongodb.com/docs)
