@echo off
chcp 65001 > nul
title Arnold NLM 환경변수 설정

:: =============================================
:: PRFS 2.0 - Arnold NLM 환경변수 자동 설정
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
echo   PRFS 2.0 Arnold NLM 환경변수 설정
echo =============================================
echo.

:: =============================================
:: 서버 IP 설정 (변경 필요시 아래 IP 수정)
:: =============================================
set SERVER_IP=223.194.101.83
set NLM_PORT=27000

echo [1/4] Arnold NLM 라이선스 서버 설정 중...
setx ADSKFLEX_LICENSE_FILE "@%SERVER_IP%" /M
if %errorLevel% equ 0 (
    echo      ADSKFLEX_LICENSE_FILE = @%SERVER_IP%  [완료]
) else (
    echo      [오류] ADSKFLEX_LICENSE_FILE 설정 실패
)

echo.
echo [2/4] solidangle 라이선스 설정 중...
setx solidangle_LICENSE "%NLM_PORT%@%SERVER_IP%" /M
if %errorLevel% equ 0 (
    echo      solidangle_LICENSE = %NLM_PORT%@%SERVER_IP%  [완료]
) else (
    echo      [오류] solidangle_LICENSE 설정 실패
)

echo.
echo [3/4] Arnold 플러그인 경로 설정 중...
setx ARNOLD_PLUGIN_PATH "C:\Program Files\Maxon Cinema 4D 2024\Arnold\plugins" /M
if %errorLevel% equ 0 (
    echo      ARNOLD_PLUGIN_PATH 설정  [완료]
) else (
    echo      [오류] ARNOLD_PLUGIN_PATH 설정 실패 (C4D 경로 확인 필요)
)

echo.
echo [4/4] 라이선스 서버 연결 테스트 중...
powershell -Command "Test-NetConnection -ComputerName %SERVER_IP% -Port %NLM_PORT% -WarningAction SilentlyContinue" | find "TcpTestSucceeded"
echo.

echo =============================================
echo   설정 완료!
echo   C4D 또는 PC를 재시작 후 렌더 테스트하세요.
echo =============================================
echo.
pause
