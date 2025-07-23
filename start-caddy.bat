@echo off
REM imprime o diretório atual (para debug)
echo ▶ Starting from: %~dp0

cd /d %~dp0
echo ▶ Using Caddyfile:
type "%~dp0Caddyfile"

caddy\caddy.exe run --config "%~dp0Caddyfile"
