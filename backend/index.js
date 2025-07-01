// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// importa o pool de conexões (com idleTimeoutMillis ajustado em db.js)
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

// URL do seu frontend
const FRONTEND_URL = 'https://tickets-frontend-kvf1.onrender.com';

// Configuração de CORS
app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Rotas públicas
app.use('/api/auth', authRouter);

// Rotas protegidas
app.use('/api/users', authenticateToken, userRouter);
app.use('/api/categories', authenticateToken, categoryRouter);
app.use('/api/atendimentos', authenticateToken, atendRouter);
app.use('/api/reports', authenticateToken, reportsRouter);

// Inicia o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
    console.log(`🚀 Backend rodando na porta ${PORT}`)
);
