@echo off
title M211 렌더팜 - Worker 환경 복구

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [오류] 관리자 권한으로 실행하세요.
    echo 파일 우클릭 - 관리자 권한으로 실행
    pause
    exit /b 1
)

set SERVER=223.194.101.83
set SHARE=2026_renderfarm
set LICSERVER=M211-00

echo ============================================
echo   Worker 환경 복구
echo ============================================
echo.

echo [1/4] NAS 연결...
net use Z: \\%SERVER%\%SHARE% /persistent:no >nul 2>&1
echo     완료

echo [2/4] 라이선스 환경변수...
REM ---------------------------------------------------------
REM  Arnold 라이선스 서버는 NAS 가 아니라 M211-00 입니다.
REM  Autodesk FlexLM(lmgrd+adskflex), TCP 27000.
REM  5053 은 Nuke 용 Foundry RLM 이며 Arnold 와 무관하므로
REM  solidangle_LICENSE 는 설정하지 않습니다.
REM ---------------------------------------------------------
setx ADSKFLEX_LICENSE_FILE "@%LICSERVER%" /M >nul
echo     완료

echo [3/4] Deadline Repository 연결...
"C:\Program Files\Thinkbox\Deadline10\bin\deadlinecommand.exe" ^
  ChangeRepository Direct \\%SERVER%\deadline_repo >nul 2>&1
echo     완료

echo [4/4] Deadline Worker 시작...
"C:\Program Files\Thinkbox\Deadline10\bin\deadlinelauncher.exe" -nogui
echo     완료

echo.
echo [검사] 라이선스 서버 연결 확인...
powershell -NoProfile -Command ^
  "$r=Test-NetConnection %LICSERVER% -Port 27000 -WarningAction SilentlyContinue; if($r.TcpTestSucceeded){'     정상 - 라이선스 서버 응답함'}else{'     [경고] 라이선스 서버(%LICSERVER%:27000) 에 연결되지 않습니다.'; '     M211-00 전원과 Arnold License 서비스를 확인하세요.'}"

echo.
echo ============================================
echo   복구 완료
echo ============================================
echo.
echo   Deadline Monitor 에서 이 PC가
echo   Online 으로 표시되는지 확인하세요.
echo.
pause
