// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const pool = require('./db');

const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const atendRouter = require('./routes/atendimentos');
const categoryRouter = require('./routes/categories');
const reportsRouter = require('./routes/reports');

const { authenticateToken } = require('./middleware/auth');

const app = express();

// --- CONFIGURAÇÃO CORS GLOBAL ---
// Use o FRONTEND_URL do seu deploy
const FRONTEND_URL = 'https://tickets-frontend-kvf1.onrender.com';

const corsOptions = {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
};
// Aplica CORS a todas as rotas
app.use(cors(corsOptions));
// Garante que o preflight seja sempre respondido
app.options('*', cors(corsOptions));

// --- MIDDLEWARES DE PARSE ---
app.use(bodyParser.json());

// --- ROTAS PÚBLICAS ---
app.use('/api/auth', authRouter);

// --- ROTAS PROTEGIDAS ---
app.use('/api/users', authenticateToken, userRouter);
app.use('/api/categories', authenticateToken, categoryRouter);
app.use('/api/atendimentos', authenticateToken, atendRouter);
app.use('/api/reports', authenticateToken, reportsRouter);

// --- START SERVER ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
});
