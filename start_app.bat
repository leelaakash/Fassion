@echo off
title Atelier Vogue Fashion Recommender
echo ========================================
echo   Starting Atelier Vogue Fashion Suite
echo ========================================

cd /d "%~dp0"

:: 1. Start Qdrant if not running
tasklist /FI "IMAGENAME eq qdrant.exe" 2>NUL | find /I /N "qdrant.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [1/3] Qdrant is already running on port 6333.
) else (
    echo [1/3] Starting Qdrant on port 6333...
    start /B "" "%~dp0qdrant\qdrant.exe"
    timeout /t 2 /nobreak >nul
)

:: 2. Start FastAPI Backend in background
echo [2/3] Starting FastAPI Backend on http://localhost:8000...
start "Atelier Vogue Backend" cmd /k ""%~dp0.venv\Scripts\python.exe" -m uvicorn src.backend.app.main:app --host 0.0.0.0 --port 8000"
timeout /t 4 /nobreak >nul

:: 3. Start Next.js Frontend
echo [3/3] Starting Next.js Frontend on http://localhost:3000...
cd "%~dp0src\frontend"
npm run dev
