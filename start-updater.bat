@echo off
title AI Group Poster - Auto-Update Companion Server
color 0b

echo ========================================================
echo   AI Group Poster - Local Companion Auto-Updater
echo ========================================================
echo.
echo Starting local update bridge on http://127.0.0.1:3959 ...
echo This allows 1-click GitHub Pull ^& Reload inside Chrome!
echo.
echo Keep this window open or minimized while using the extension.
echo.

node scripts/local-updater.js

pause
