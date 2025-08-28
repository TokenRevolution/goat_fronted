@echo off
echo =====================================================
echo         🐐 GOAT PLATFORM - AVVIO SISTEMA 🐐
echo =====================================================
echo.
echo Implementazione Business Model:
echo ✅ Return Rates: 0%%, 5%%, 6%%, 7%%, 8%%, 9%%, 10%%
echo ✅ Position Levels: Cliente + Posizione 1-8
echo ✅ Network Bonuses: 10%% - 50%%
echo ✅ Daily Credits: 00:00 ogni giorno
echo ✅ Global API Rate Limiter
echo ✅ Schema Database Aggiornato
echo.
echo Avviando React Development Server...
echo.

REM Uccide processi Node.js esistenti
taskkill /f /im node.exe 2>nul

REM Avvia il server React
npm start

echo.
echo =====================================================
echo                🎯 GOAT READY! 🎯
echo =====================================================
pause
