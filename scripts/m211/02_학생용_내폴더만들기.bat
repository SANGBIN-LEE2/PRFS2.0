@echo off
title M211 렌더팜 - 내 작업 폴더 만들기

set NASIP=223.194.101.83
set SHARE=2026_renderfarm
set BASE=\\%NASIP%\%SHARE%

echo ============================================
echo   내 작업 폴더 만들기
echo ============================================
echo.

set /p SID=학번을 입력하세요 (예: C393169) :
if "%SID%"=="" goto :err

echo.
echo 작업 폴더 이름을 입력하세요.
echo 형식 : 날짜_작업이름   (예: 20261020_test)
echo 한글과 공백은 쓸 수 없습니다.
echo.
set /p JOB=작업 폴더 이름 :
if "%JOB%"=="" goto :err

echo.
echo 만들 폴더
echo   %BASE%\input\%SID%\%JOB%\
echo   %BASE%\output\%SID%\%JOB%\
echo.
set /p OK=진행할까요? (Y/N) :
if /i not "%OK%"=="Y" goto :cancel

mkdir "%BASE%\input\%SID%\%JOB%\scenes"    2>nul
mkdir "%BASE%\input\%SID%\%JOB%\textures"  2>nul
mkdir "%BASE%\input\%SID%\%JOB%\cache"     2>nul
mkdir "%BASE%\output\%SID%\%JOB%"          2>nul

copy "%BASE%\input\00_TEMPLATE\JOB_INFO.txt" ^
     "%BASE%\input\%SID%\%JOB%\JOB_INFO.txt" >nul 2>&1

echo.
echo ============================================
echo   폴더 생성 완료
echo ============================================
echo.
echo   씬 파일 넣는 곳
echo   %BASE%\input\%SID%\%JOB%\scenes\
echo.
echo   렌더 출력 경로로 지정할 곳
echo   %BASE%\output\%SID%\%JOB%\
echo.
echo   JOB_INFO.txt 를 작성해주세요.
echo.

explorer "%BASE%\input\%SID%\%JOB%"
pause
exit /b 0

:err
echo.
echo [오류] 값을 입력하지 않았습니다.
pause
exit /b 1

:cancel
echo 취소했습니다.
pause
exit /b 0
