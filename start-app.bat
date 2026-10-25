@echo off
echo ===================================================
echo   Khoi dong he thong DateSpot (Backend + Frontend)
echo ===================================================
start "DateSpot Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && (if not exist node_modules npm install) && npm run dev"
start "DateSpot Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && (if not exist node_modules npm install) && npm run dev"
echo Da mo 2 cua so Backend (http://localhost:5000) va Frontend (http://localhost:5173)
