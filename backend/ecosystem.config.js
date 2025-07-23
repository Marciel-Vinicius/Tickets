// C:\Users\nest\Desktop\Tickets\backend\ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'tickets-backend',
      script: 'index.js',
      cwd: __dirname,
      env: {
        PORT:         '10000',
        DATABASE_URL: 'postgres://postgres:84365646@localhost:5430/tickets',
        NODE_ENV:     'development'
      },
      env_production: {
        PORT:         '10000',
        DATABASE_URL: 'postgres://postgres:84365646@localhost:5430/tickets',
        NODE_ENV:     'production'
      }
    }
  ]
};
