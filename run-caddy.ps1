# run-caddy.ps1
# Vai para a pasta raiz do projeto
Set-Location $PSScriptRoot

# Inicia o Caddy com o Caddyfile desta pasta
& ".\caddy\caddy.exe" run --config ".\Caddyfile"
