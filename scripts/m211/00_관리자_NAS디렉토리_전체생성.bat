@echo off
setlocal
title M211 렌더팜 - NAS 디렉토리 전체 생성 (관리자용)

echo ================================================================
echo   M211 렌더팜 NAS 디렉토리 전체 생성
echo ================================================================
echo.
echo   이 스크립트는 NAS에 2026_renderfarm 폴더 구조를 만듭니다.
echo   최초 1회만 실행하세요.
echo.

set NASIP=223.194.101.83
set SHARE=2026_renderfarm
set BASE=\\%NASIP%\%SHARE%

echo   대상 경로 : %BASE%
echo.
set /p OK=진행할까요? (Y/N) :
if /i not "%OK%"=="Y" goto :cancel

echo.
echo [1/5] NAS 연결 확인...
if not exist "%BASE%\" (
    echo.
    echo   [실패] %BASE% 에 접근할 수 없습니다.
    echo.
    echo   확인할 것
    echo     1. NAS에서 2026_renderfarm 공유 폴더를 먼저 만드세요
    echo        DSM - 제어판 - 공유 폴더 - 만들기
    echo     2. SMB 서비스가 켜져 있는지 확인
    echo        DSM - 제어판 - 파일 서비스 - SMB 활성화
    echo     3. 계정에 쓰기 권한이 있는지 확인
    echo.
    pause
    exit /b 1
)
echo       OK

echo [2/5] 안내 폴더 생성...
mkdir "%BASE%\00_READ_ME_FIRST"                          2>nul
echo       OK

echo [3/5] input 구조 생성...
mkdir "%BASE%\input"                                     2>nul
mkdir "%BASE%\input\00_TEMPLATE\scenes"                  2>nul
mkdir "%BASE%\input\00_TEMPLATE\textures"                2>nul
mkdir "%BASE%\input\00_TEMPLATE\cache"                   2>nul
mkdir "%BASE%\input\C393169\20261020_test\scenes"        2>nul
mkdir "%BASE%\input\C393169\20261020_test\textures"      2>nul
mkdir "%BASE%\input\C393169\20261020_test\cache"         2>nul
echo       OK

echo [4/5] output 구조 생성...
mkdir "%BASE%\output"                                    2>nul
mkdir "%BASE%\output\C393169\20261020_test"              2>nul
echo       OK

echo [5/5] 관리자 폴더 생성...
mkdir "%BASE%\_admin\scripts"                            2>nul
mkdir "%BASE%\_admin\logs"                               2>nul
mkdir "%BASE%\_admin\docs"                               2>nul
echo       OK

echo.
echo ================================================================
echo   생성 완료
echo ================================================================
echo.
echo   학생에게 알려줄 경로
echo.
echo     업로드  %BASE%\input\
echo     결과물  %BASE%\output\
echo.
echo ----------------------------------------------------------------
echo   남은 작업 (수동)
echo ----------------------------------------------------------------
echo.
echo   1. ZIP 안의 README / JOB_INFO / bat 파일들을
echo      각 폴더에 복사하세요
echo      (ZIP을 그대로 풀면 한 번에 들어갑니다)
echo.
echo   2. NAS 권한 설정
echo      DSM - 제어판 - 공유 폴더 - 2026_renderfarm - 편집 - 권한
echo.
echo        학생 계정   input   읽기/쓰기
echo                    output  읽기/쓰기
echo                    _admin  접근 불가
echo.
echo   3. 휴지통 비활성화 권장
echo      DSM - 제어판 - 공유 폴더 - 2026_renderfarm - 편집
echo      휴지통 활성화 체크 해제
echo      (렌더 결과물로 용량이 빠르게 찹니다)
echo.
pause

explorer "%BASE%"
exit /b 0

:cancel
echo 취소했습니다.
pause
exit /b 0

