// start-caddy.js
const { spawn } = require('child_process');
const path = require('path');

// Caminhos absolutos
const caddyExe = path.join(__dirname, 'caddy', 'caddy.exe');
const caddyfile = path.join(__dirname, 'Caddyfile');

// Monta o comando completo
const cmd = `"${caddyExe}" run --config "${caddyfile}"`;

console.log('🚀 Starting Caddy with command:', cmd);

const child = spawn(cmd, {
  shell: true,
  cwd: __dirname,
  stdio: 'inherit'
});

child.on('exit', code => {
  console.error(`❌ Caddy exited with code ${code}`);
  process.exit(code);
});

child.on('error', err => {
  console.error('❌ Failed to start Caddy:', err);
  process.exit(1);
});
