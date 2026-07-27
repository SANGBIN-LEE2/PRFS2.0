# 🎨 Blender Deadline Worker 설치 가이드

> M동 실습실 Blender 사용자용 Deadline Worker 설치 가이드  
> PRFS 2.0 프로젝트

---

## 📌 사전 준비

- [ ] USB 지참 (Deadline 설치파일 포함)
- [ ] 관리자 권한 계정 확인
- [ ] 서버 PC IP 확인 (M동: `223.194.101.83`)

---

## 🔴 STEP 1: 서버 연결 확인

CMD 열고:
```cmd
ping 223.194.101.83
```
응답 오면 네트워크 연결 OK ✅

---

## 🔴 STEP 2: Deadline Client 설치

**① 탐색기에서 아래 경로 접속:**
```
\\223.194.101.83\DeadlineRepository10
```

**② 설치파일 실행**
- `DeadlineClient.exe` 더블클릭

**③ 설치 유형 선택**
- **Client** 선택 후 Next

**④ Repository 경로 입력**
```
\\223.194.101.83\DeadlineRepository10
```

**⑤ Deadline Launcher 설정**
- **Launch Worker When Launcher Starts** ✅ 체크
- Next → 설치 완료

---

## 🔴 STEP 3: 인증서 등록

Repository 폴더에서 인증서 파일 복사:
```
\\223.194.101.83\DeadlineRepository10\certs\Deadline10RemoteClient.pfx
```

아래 경로에 붙여넣기:
```
C:\ProgramData\Thinkbox\Deadline10\certificate\
```

Deadline Launcher 재시작

---

## 🔴 STEP 4: NAS 경로 마운트

CMD 관리자 권한으로:
```cmd
net use \\223.194.101.83\deadline_repo /user:deadlineuser <비밀번호> /persistent:yes
```

---

## 🔴 STEP 5: Blender 플러그인 설치

**① Deadline Monitor 실행**

**② 상단 메뉴:**
```
Tools → Install Deadline Client → Blender 선택
```

**③ Blender 설치 경로 확인**
```
C:\Program Files\Blender Foundation\Blender x.x\
```

---

## ✅ STEP 6: 설치 확인

서버 PC Deadline Monitor에서:
- Worker 목록에 해당 PC 이름이 **Online/Idle** 상태로 뜨면 성공! 🎉

---

## ⚠️ 자주 생기는 문제

| 문제 | 원인 | 해결 |
|------|------|------|
| Worker가 Monitor에 안 보임 | Repository 경로 오류 | UNC 경로 재확인 |
| 인증서 오류 | .pfx 파일 미등록 | certificate 폴더에 복사 |
| NAS 접근 불가 | net use 미설정 | net use 명령 재실행 |
| 재부팅 후 설정 초기화 | Deep Freeze | 시작프로그램에 net use 스크립트 등록 |

---

## 📝 참고사항

- Blender는 Arnold 라이선스 불필요 (자체 Cycles/Eevee 렌더러 사용)
- Deadline Worker 설치만으로 바로 렌더팜 연결 가능
- 씬 파일은 반드시 NAS UNC 경로에 저장할 것
  ```
  \\223.194.101.83\deadline_repo\renderfarm\input\학번\날짜\
  ```
