module.exports = {
    apps: [
      {
        name: 'api-server',
        script: 'api-server.js',
        cwd: __dirname,
        interpreter: 'node',
        env: { PORT: 10000 }
      },
      {
        name: 'caddy',
        script: 'caddy\\caddy.exe',
        cwd: __dirname,
        interpreter: 'none',
        args: 'run --config Caddyfile'
      }
    ]
  };
  