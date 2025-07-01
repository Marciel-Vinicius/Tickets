// src/index.js
require('dotenv').config();
const express = require('express');
const pool = require('./db');               // seu pool
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const atendRouter = require('./routes/atendimentos');
const categoryRouter = require('./routes/categories');
const reportsRouter = require('./routes/reports');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// --- CORS MANUAL PARA TODAS ROTAS ---
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        );
        return res.sendStatus(200);
    }
    next();
});

// --- PARSE JSON ---
app.use(express.json());

// --- ROTAS PÚBLICAS ---
app.use('/api/auth', authRouter);

// --- ROTAS PROTEGIDAS ---
app.use('/api/users', authenticateToken, userRouter);
app.use('/api/categories', authenticateToken, categoryRouter);
app.use('/api/atendimentos', authenticateToken, atendRouter);
app.use('/api/reports', authenticateToken, reportsRouter);

// --- INICIA O SERVIDOR ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
    console.log(`🚀 Backend rodando na porta ${PORT}`)
);
