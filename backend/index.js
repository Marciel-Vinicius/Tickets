// backend/index.js
const express = require('express');
const cors = require('cors');

// rotas
const authRouter         = require('./routes/auth');
const usersRouter        = require('./routes/users');
const categoriesRouter   = require('./routes/categories');
const atendimentosRouter = require('./routes/atendimentos');
const reportsRouter      = require('./routes/reports');

const { authenticate } = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

// → rotas públicas de auth (login/register)
app.use('/api/auth', authRouter);

// → aplica autenticação em todas as rotas abaixo
app.use(authenticate);

// → rotas protegidas
app.use('/api/users',      usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/atendimentos', atendimentosRouter);

// → rotas de relatórios
app.use('/api/reports', reportsRouter);

// Exporta o app para ser usado pelo server.js (HTTPS)
module.exports = app;
