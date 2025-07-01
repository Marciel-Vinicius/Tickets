// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// importa a configuração do pool (db.js)
const pool = require('./db');

// rotas
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const atendRouter = require('./routes/atendimentos');
const categoryRouter = require('./routes/categories');
const reportsRouter = require('./routes/reports');

// middleware de autenticação
const { authenticateToken } = require('./middleware/auth');

const app = express();

// 1) Habilita CORS para **todas** as rotas e ORIGENS
app.use(cors());           // <== aceita qualquer origem
app.use(bodyParser.json());

// 2) Rotas públicas
app.use('/api/auth', authRouter);

// 3) Rotas protegidas
app.use('/api/users', authenticateToken, userRouter);
app.use('/api/categories', authenticateToken, categoryRouter);
app.use('/api/atendimentos', authenticateToken, atendRouter);
app.use('/api/reports', authenticateToken, reportsRouter);

// 4) Inicia o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
    console.log(`🚀 Backend rodando na porta ${PORT}`)
);
