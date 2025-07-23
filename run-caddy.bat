@echo off
REM Vai para a raiz do Tickets
cd /d "%~dp0"

REM Chama o Caddy com o Caddyfile da raiz
.\caddy\caddy.exe run --config "Caddyfile"