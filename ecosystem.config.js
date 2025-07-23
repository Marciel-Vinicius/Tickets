// C:\Users\nest\Desktop\Tickets\ecosystem.config.js
module.exports = {
  apps: [

    // seu backend Node
    {
      name: 'api-server',
      script: 'backend/index.js',
      cwd: __dirname,
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: '10000',
        DATABASE_URL: 'postgres://postgres:84365646@localhost:5430/tickets'
      }
    },

    // Caddy via batch
    {
      name: 'caddy',
      script: 'start-caddy.bat',
      cwd: __dirname,
      interpreter: 'cmd.exe',
      interpreter_args: '/c'
    }
  ]
};
