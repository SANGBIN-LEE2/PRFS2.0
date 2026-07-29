# 🔧 PRFS 2.0 트러블슈팅 기록

> T동 C4D 전용 렌더팜 구축 과정에서 발생한 문제 및 해결 방법

---

## 2026.07.07 — 서버 PC 초기 설치

### MongoDB 외부 접근 불가
- **증상:** `netstat`에서 `127.0.0.1:27017`로만 LISTENING
- **원인:** `mongod.cfg`의 `bindIp`가 `127.0.0.1`로 설정되어 외부 접근 차단
- **해결:**
  ```yaml
  net:
    port: 27017
    bindIp: 0.0.0.0
  ```
  수정 후 MongoDB 재시작
  ```powershell
  net stop MongoDB
  net start MongoDB
  ```

---

### Deadline Repository UNC 경로 인식 실패
- **증상:** Repository 설치 시 Invalid 오류
- **원인:** Deadline이 UNC 경로를 Repository로 직접 인식 못함
- **해결:** 로컬 경로(`C:\DeadlineRepository10`)에 설치 후 네트워크 공유로 내보내기
  ```powershell
  net share DeadlineRepository10=C:\DeadlineRepository10 /GRANT:Everyone,FULL
  ```

---

## 2026.07.28 — Worker PC 6대 설치

### Worker PC에서 Repository 접근 불가 (빈 암호 문제)
- **증상:** `\\203.249.94.106\DeadlineRepository10` 접속 시 "계정 제한으로 인해 로그인 불가"
- **원인:** 서버 PC 윈도우 계정에 비밀번호가 없어 네트워크 접근 차단
- **해결:** 서버 PC에서 비밀번호 설정
  ```powershell
  net user user 1234
  ```
  Worker PC에서:
  ```cmd
  net use \\203.249.94.106\DeadlineRepository10 /user:user 1234
  ```

---

### MongoDB 27017 포트 방화벽 차단
- **증상:** Deadline Monitor에서 "Could not connect to any of the specified MongoDB servers"
- **원인:** 서버 PC 방화벽에서 27017 포트 차단
- **해결:** 서버 PC에서 인바운드 규칙 추가
  ```powershell
  netsh advfirewall firewall add rule name="MongoDB27017" dir=in action=allow protocol=TCP localport=27017
  ```

---

### 파일 및 프린터 공유 꺼짐
- **증상:** Worker PC에서 서버 PC 네트워크 경로 접근 불가
- **원인:** 서버 PC의 파일 및 프린터 공유 비활성화
- **해결:** 제어판 → 네트워크 및 공유 센터 → 고급 공유 설정 → 파일 및 프린터 공유 켜기

---

### Arnold 환경변수 배치파일 인코딩 오류
- **증상:** 배치파일 실행 시 한글이 깨지며 명령어 인식 불가
- **원인:** Windows CMD의 한글 인코딩(EUC-KR) 문제
- **해결:** 배치파일에서 한글 주석 전부 제거하고 영어로만 작성
  ```batch
  @echo off
  title Arnold NLM License Setup
  ```

---

### C4D Deadline 플러그인 확장 탭 미표시
- **증상:** C4D 확장 탭에 Submit to Deadline 없음
- **원인:** C4D 2026에서 플러그인 경로가 자동 인식되지 않음
- **해결:** C4D 환경설정에서 플러그인 경로 수동 추가
  - **편집 → 환경설정 → 플러그인 → 폴더 추가하기**
  - 경로: `C:\Program Files\Maxon Cinema 4D 2026\Deadline\Client`
  - C4D 재시작 후 확인

---

### NAS QuickConnect 접속 불가
- **증상:** `http://QuickConnect.to/M211NAS` 접속 시 연결 불가
- **원인:** M동 NAS 전원이 꺼져 있었음
- **해결:** 조교님께 NAS 전원 켜기 요청

---

## 공통 확인 명령어

```powershell
# MongoDB 포트 확인
netstat -an | findstr "27017"

# Arnold 라이선스 서버 포트 확인
netstat -an | findstr "27000"

# Deadline Repository 포트 확인
netstat -an | findstr "4433"

# Arnold 환경변수 확인
[System.Environment]::GetEnvironmentVariable("solidangle_LICENSE", "Machine")

# 서버 ping 확인
ping 203.249.94.106

# NAS ping 확인
ping 223.194.101.83
```
2026.07.28 — C4D 렌더 테스트 이슈
이슈 1: Deadline 10 C4D 2026 미지원
증상: C4D 2026으로 렌더 제출 시 실행 안됨
원인: Deadline 10이 유지보수 모드라 C4D 2026 공식 미지원, 추후 업데이트 예정 없음
해결: Cinema4DBatch.param 파일에 C4D 2026 실행파일 경로 직접 추가
상태: ✅ 임시 해결
이슈 2: C4D 라이선스 세션 충돌
증상: 렌더 워커 실행 시 C4D 라이선스 인증 단계에서 멈춤
원인: T104 PC들이 수업용 공용 학생 라이선스(개인 명의)로 등록되어 있어 수업 중 학생 로그인과 렌더팜 Worker 세션 충돌 가능성 있음
조치: 조교님께 Maxon License Server(네트워크 라이선스) 발급/설치 가능 여부 문의 중
상태: 🔄 답변 대기 중
