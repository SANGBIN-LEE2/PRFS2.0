# 🛠️ T동 렌더팜 설치 가이드

> PRFS 2.0 — T동 C4D 전용 렌더팜  
> 서버 PC 및 Worker PC 설치 전체 가이드

---

## 📌 사전 준비물 (USB)

```
📁 USB
├── DeadlineClient-10.x.x.x.exe
├── MongoDB 7.0 설치파일.msi
├── Arnold .lic 라이선스 파일
├── set_arnold_license.bat
└── C4D Deadline 플러그인
```

---

## 🖥️ STEP 1: 서버 PC (T104-00) 세팅

### 1-1. MongoDB 설치

**① 설치파일 실행**
- Version: **7.0** (Deadline 호환 버전)
- **"Install MongoDB as a Service"** ✅ 체크

**② 외부 접근 허용 설정**

메모장으로 아래 파일 열기 (관리자 권한):
```
C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg
```

`bindIp` 수정:
```yaml
net:
  port: 27017
  bindIp: 0.0.0.0
```

**③ MongoDB 재시작 (관리자 권한 PowerShell):**
```powershell
net stop MongoDB
net start MongoDB
```

**④ 확인:**
```powershell
netstat -an | findstr "27017"
# 0.0.0.0:27017 LISTENING 뜨면 성공
```

---

### 1-2. Deadline Repository 설치

**① 설치파일 실행**
- 설치 유형: **Repository** 선택

**② MongoDB 연결 설정**

| 항목 | 값 |
|------|-----|
| Database Server | `203.249.94.106` |
| Database Port | `27017` |
| Database Name | `deadline10db` |

**③ Repository 네트워크 공유**

관리자 권한 PowerShell:
```powershell
net share DeadlineRepository10=C:\DeadlineRepository10 /GRANT:Everyone,FULL
```

**④ 방화벽 포트 개방:**
```powershell
netsh advfirewall firewall add rule name="MongoDB" dir=in action=allow protocol=TCP localport=27017
netsh advfirewall firewall add rule name="Deadline" dir=in action=allow protocol=TCP localport=4433
netsh advfirewall firewall add rule name="ArnoldNLM" dir=in action=allow protocol=TCP localport=27000
```

---

### 1-3. Deadline Client 설치 (서버 PC)

**① 설치파일 실행**
- 설치 유형: **Client** 선택
- Server Address: `203.249.94.106:8080`

**② Deadline Monitor 실행**
- Repository Path: `C:\DeadlineRepository10`
- Direct Connection 선택
- Workers 패널에 서버 PC가 **Idle** 상태로 뜨면 성공 ✅

---

### 1-4. Arnold NLM 라이선스 서버 설치

**① lmtools.exe 실행 (관리자 권한)**

**② Config Services 탭 설정:**

| 항목 | 값 |
|------|-----|
| Path to lmgrd.exe | `C:\Autodesk\Network License Manager\lmgrd.exe` |
| Path to license file | Arnold `.lic` 파일 경로 |
| Path to debug log | `C:\Autodesk\Network License Manager\debug.log` |

**③ Start Server 클릭**

**④ 확인:**
```powershell
netstat -an | findstr "27000"
# 0.0.0.0:27000 LISTENING 뜨면 성공
```

---

### 1-5. 스토리지 폴더 생성

탐색기에서 폴더 생성 후 공유:
```
C:\renderfarm\
  ├── input\
  └── output\
```

```powershell
net share renderfarm=C:\renderfarm /GRANT:Everyone,FULL
```

---

## 💻 STEP 2: Worker PC 6대 세팅

> 서버 PC 완전히 세팅된 후 진행!

### 2-1. Deadline Client 설치

**① 탐색기에서 접속:**
```
\\203.249.94.106\DeadlineRepository10
```

**② 설치파일 실행**
- 설치 유형: **Client** 선택
- Repository 경로: `\\203.249.94.106\DeadlineRepository10`

---

### 2-2. 인증서 등록

Repository에서 인증서 복사:
```
\\203.249.94.106\DeadlineRepository10\certs\Deadline10RemoteClient.pfx
```

아래 경로에 붙여넣기:
```
C:\ProgramData\Thinkbox\Deadline10\certificate\
```

---

### 2-3. Arnold 환경변수 설정

USB의 `set_arnold_license.bat` 파일:
- **우클릭 → 관리자 권한으로 실행**

자동으로 아래 환경변수 설정됨:

| 변수명 | 값 |
|--------|-----|
| `ADSKFLEX_LICENSE_FILE` | `@203.249.94.106` |
| `solidangle_LICENSE` | `27000@203.249.94.106` |

---

### 2-4. C4D Deadline 플러그인 설치

1. Deadline Monitor 실행
2. `Tools → Install Deadline Client → Cinema 4D` 선택
3. C4D 실행 후 상단 메뉴에 **Submit to Deadline** 확인 ✅

---

### 2-5. NAS 경로 마운트

```powershell
net use \\203.249.94.106\renderfarm /persistent:yes
```

---

## ✅ STEP 3: 최종 테스트

**① Deadline Monitor에서 Worker 6대 Online 확인**

**② Arnold 라이선스 연결 확인:**
```powershell
Test-NetConnection -ComputerName 203.249.94.106 -Port 27000
# TcpTestSucceeded: True 뜨면 성공
```

**③ C4D 렌더 테스트:**
- C4D에서 간단한 씬 파일 열기
- Submit to Deadline 클릭
- Deadline Monitor에서 확인:
  ```
  Queued → Rendering → Completed
  ```

---

## ⚠️ 자주 생기는 문제

| 문제 | 원인 | 해결 |
|------|------|------|
| Worker가 Repository 못 찾음 | UNC 경로 오류 | `\\203.249.94.106\DeadlineRepository10` 재확인 |
| Arnold 라이선스 오류 | 환경변수 미설정 | `set_arnold_license.bat` 재실행 |
| MongoDB 연결 실패 | bindIp 설정 오류 | `mongod.cfg` 수정 후 재시작 |
| 렌더 실패 | UNC 경로 불일치 | 씬 파일 경로 NAS 경로로 통일 |
| 재부팅 후 설정 초기화 | Deep Freeze | 시작프로그램에 bat 파일 등록 |

---

## 📝 참고사항

- 서버 PC 고정 IP: `203.249.94.106`
- IP 바뀌면 Worker 전체 재설정 필요하므로 고정 IP 유지 필수
- C4D 씬 파일은 반드시 NAS UNC 경로에 저장:
  ```
  \\203.249.94.106\renderfarm\input\학번\날짜\scene.c4d
  ```
