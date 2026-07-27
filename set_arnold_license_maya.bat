@echo off
chcp 65001 > nul
title Arnold NLM 환경변수 설정 (Maya용)

:: =============================================
:: PRFS 1.0 - Arnold NLM 환경변수 자동 설정
:: Maya + Arnold 전용 (M동 실습실)
:: 사용법: 관리자 권한으로 실행
:: =============================================

:: 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [오류] 관리자 권한으로 실행해주세요!
    echo 이 파일을 우클릭 후 "관리자 권한으로 실행" 선택
    pause
    exit /b
)

echo.
echo =============================================
echo   PRFS 1.0 Arnold NLM 환경변수 설정
echo   Maya + Arnold 전용 (M동 실습실)
echo =============================================
echo.

:: =============================================
:: 서버 IP 설정
:: =============================================
set SERVER_IP=223.194.101.83
set NLM_PORT=27000

echo [1/5] Arnold NLM 라이선스 서버 설정 중...
setx ADSKFLEX_LICENSE_FILE "@%SERVER_IP%" /M
if %errorLevel% equ 0 (
    echo      ADSKFLEX_LICENSE_FILE = @%SERVER_IP%  [완료]
) else (
    echo      [오류] ADSKFLEX_LICENSE_FILE 설정 실패
)

echo.
echo [2/5] solidangle 라이선스 설정 중...
setx solidangle_LICENSE "%NLM_PORT%@%SERVER_IP%" /M
if %errorLevel% equ 0 (
    echo      solidangle_LICENSE = %NLM_PORT%@%SERVER_IP%  [완료]
) else (
    echo      [오류] solidangle_LICENSE 설정 실패
)

echo.
echo [3/5] MtoA (Maya to Arnold) 경로 설정 중...
setx MTOA_EXTENSIONS_PATH "C:\solidangle\mtoadeploy\2025\extensions" /M
setx MTOA_TEMPLATES_PATH "C:\solidangle\mtoadeploy\2025\ae" /M
if %errorLevel% equ 0 (
    echo      MtoA 경로 설정  [완료]
) else (
    echo      [오류] MtoA 경로 설정 실패 (Maya 버전 확인 필요)
)

echo.
echo [4/5] Arnold 플러그인 경로 설정 중...
setx ARNOLD_PLUGIN_PATH "C:\solidangle\mtoadeploy\2025\plug-ins" /M
if %errorLevel% equ 0 (
    echo      ARNOLD_PLUGIN_PATH 설정  [완료]
) else (
    echo      [오류] ARNOLD_PLUGIN_PATH 설정 실패
)

echo.
echo [5/5] 라이선스 서버 연결 테스트 중...
powershell -Command "Test-NetConnection -ComputerName %SERVER_IP% -Port %NLM_PORT% -WarningAction SilentlyContinue" | find "TcpTestSucceeded"
echo.

echo =============================================
echo   설정 완료!
echo   Maya 또는 PC를 재시작 후 렌더 테스트하세요.
echo =============================================
echo.
pause
