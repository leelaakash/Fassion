# Atelier Vogue Launcher Script for Windows PowerShell
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Atelier Vogue Fashion Suite  " -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot

# 1. Start Qdrant Vector Engine
$qdrantRunning = Get-Process -Name "qdrant" -ErrorAction SilentlyContinue
if (-not $qdrantRunning) {
    Write-Host "[1/3] Starting Qdrant Vector Engine on port 6333..." -ForegroundColor Green
    Start-Process -FilePath "$WorkspaceRoot\qdrant\qdrant.exe" -WorkingDirectory "$WorkspaceRoot\qdrant" -WindowStyle Hidden
    Start-Sleep -Seconds 2
} else {
    Write-Host "[1/3] Qdrant is already running on port 6333." -ForegroundColor DarkGray
}

# 2. Start FastAPI Backend
$backendTest = Test-NetConnection -ComputerName 127.0.0.1 -Port 8000 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $backendTest) {
    Write-Host "[2/3] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
    Start-Process -FilePath "$WorkspaceRoot\.venv\Scripts\python.exe" -ArgumentList "-m uvicorn src.backend.app.main:app --host 0.0.0.0 --port 8000" -WorkingDirectory "$WorkspaceRoot" -WindowStyle Normal
    Start-Sleep -Seconds 3
} else {
    Write-Host "[2/3] FastAPI backend is already running on http://localhost:8000." -ForegroundColor DarkGray
}

# 3. Start Next.js Frontend
Write-Host "[3/3] Starting Next.js Frontend on http://localhost:3000..." -ForegroundColor Green
Set-Location -Path "$WorkspaceRoot\src\frontend"
npm run dev
