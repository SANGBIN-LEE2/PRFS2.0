@echo off
title M211 렌더팜 - NAS 연결

echo ============================================
echo   M211 렌더팜 NAS 연결
echo ============================================
echo.

set NASIP=223.194.101.83
set SHARE=2026_renderfarm

echo [1/2] 기존 연결 정리...
net use Z: /delete /y >nul 2>&1

echo [2/2] NAS 연결 중...
net use Z: \\%NASIP%\%SHARE% /persistent:no

if %errorlevel% neq 0 (
    echo.
    echo [실패] NAS에 연결하지 못했습니다.
    echo.
    echo 확인할 것
    echo   1. 실습실 네트워크에 연결되어 있는지
    echo   2. 계정 정보가 맞는지
    echo   3. 담당자에게 권한을 받았는지
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   연결 완료
echo ============================================
echo.
echo   내 업로드 폴더
echo   \\%NASIP%\%SHARE%\input\
echo.
echo   내 결과물 폴더
echo   \\%NASIP%\%SHARE%\output\
echo.
echo   * 렌더 제출 시에는 Z: 가 아니라
echo     \\%NASIP%\%SHARE%\ 경로를 쓰세요
echo.

explorer \\%NASIP%\%SHARE%
pause
