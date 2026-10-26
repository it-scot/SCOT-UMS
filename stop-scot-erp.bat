@echo off
TITLE SCOT Campus ERP - Shutdown Script
color 0C
echo ========================================================
echo   SCOT Campus ERP - Stopping All Services...
echo ========================================================
echo.

:: 1. Navigate to Project Root
cd /d "%~dp0"

:: 2. Stop and Remove Docker Containers (Postgres, etc.)
echo [1/2] Stopping Docker Infrastructure (Postgres)...
if exist "docker-compose.yml" (
    docker compose down
    echo [INFO] Docker containers stopped successfully!
) else (
    echo [WARNING] docker-compose.yml not found. Skipping docker down.
)
echo.

:: 3. Kill running Node / Java processes related to the project (optional safeguard)
echo [2/2] Cleaning up active terminal processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im java.exe >nul 2>&1
echo [INFO] Background service processes terminated.
echo.

echo ========================================================
echo   All Services Stopped Successfully!
echo ========================================================
timeout /t 4 >nul
exit