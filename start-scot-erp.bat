@echo off
TITLE SCOT Campus ERP - Master Startup Script
color 0B
echo ========================================================
echo   SCOT Campus ERP - Automated Startup System
echo ========================================================
echo.

:: 1. Navigate to Project Root (where this bat file is placed)
cd /d "%~dp0"

:: 2. Start Docker / PostgreSQL Services (Check if docker-compose exists)
echo [1/3] Starting Database & Infrastructure (Docker Compose)...
if exist "docker-compose.yml" (
    docker compose up -d
    echo [INFO] Docker containers started successfully!
) else (
    echo [WARNING] docker-compose.yml not found in root. Skipping docker start.
)
echo.

:: 3. Start Backend in a NEW separate Terminal Window
echo [2/3] Launching Backend Service in a new terminal...
if exist "backend" (
    start "SCOT Backend Server" cmd /k "cd /d "%~dp0backend" && mvn spring-boot:run"
) else if exist "server" (
    start "SCOT Backend Server" cmd /k "cd /d "%~dp0server" && npm run dev"
) else (
    echo [ERROR] Backend folder not found! Please check folder name.
)
echo.

:: 4. Start Frontend in another NEW separate Terminal Window
echo [3/3] Launching Frontend Application in a new terminal...
if exist "frontend" (
    start "SCOT Frontend App" cmd /k "cd /d "%~dp0frontend" && npm run dev"
) else if exist "client" (
    start "SCOT Frontend App" cmd /k "cd /d "%~dp0client" && npm run dev"
) else (
    echo [ERROR] Frontend folder not found! Please check folder name.
)
echo.

echo ========================================================
echo   All Services Triggered Successfully! Enjoy Coding.
echo ========================================================
timeout /t 5 >nul
exit