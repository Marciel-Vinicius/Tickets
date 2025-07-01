// backend/index.js
require('dotenv').config();
const express = require('express');
const pool = require('./db');               // usa o db.js acima
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const atendRouter = require('./routes/atendimentos');
const categoryRouter = require('./routes/categories');
const reportsRouter = require('./routes/reports');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// 1) CORS manual em TODAS as rotas e respostas
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // ou restrinja ao seu domínio
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

// 2) Parser de JSON
app.use(express.json());

// 3) Rotas públicas
app.use('/api/auth', authRouter);

// 4) Rotas protegidas
app.use('/api/users', authenticateToken, userRouter);
app.use('/api/categories', authenticateToken, categoryRouter);
app.use('/api/atendimentos', authenticateToken, atendRouter);
app.use('/api/reports', authenticateToken, reportsRouter);

// 5) Inicia o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
    console.log(`🚀 Backend rodando na porta ${PORT}`)
);
