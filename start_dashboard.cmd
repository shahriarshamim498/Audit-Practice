@echo off
title Client Transaction Audit Dashboard
echo Starting Live Audit Dashboard on http://localhost:3000/ ...
start "" "http://localhost:3000/"
powershell -ExecutionPolicy Bypass -File .\server_tcp.ps1
pause
