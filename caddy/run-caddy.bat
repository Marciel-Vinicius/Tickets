@echo off
REM Vai para a pasta do bat (Caddy)
pushd %~dp0

REM Roda o Caddy com o Caddyfile da raiz do Tickets
.\caddy.exe run --config ..\Caddyfile
