@echo off
title Arnold NLM License Setup

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Please run as Administrator
    pause
    exit /b
)

set SERVER_IP=203.249.94.106
set NLM_PORT=27000

echo Setting ADSKFLEX_LICENSE_FILE...
setx ADSKFLEX_LICENSE_FILE "@%SERVER_IP%" /M

echo Setting solidangle_LICENSE...
setx solidangle_LICENSE "%NLM_PORT%@%SERVER_IP%" /M

echo Setting ARNOLD_PLUGIN_PATH...
setx ARNOLD_PLUGIN_PATH "C:\Program Files\Maxon Cinema 4D 2026\Arnold\plugins" /M

echo Testing connection...
ping -n 1 %SERVER_IP% | find "TTL"
if %errorLevel% equ 0 (
    echo Server OK!
) else (
    echo Server connection FAILED
)

echo Done! Please restart C4D.
pause
