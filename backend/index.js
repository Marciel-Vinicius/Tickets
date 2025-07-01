// backend/index.js
require('dotenv').config();

const express = require('express');
const pool = require('./db');               // seu pool com Promise definido
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const atendRouter = require('./routes/atendimentos');
const categoryRouter = require('./routes/categories');
const reportsRouter = require('./routes/reports');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// 1) FORÇA CORS EM TODAS AS ROTAS
app.use((req, res, next) => {
    // permite qualquer origem (mude para seu domínio em produção, se desejar)
    res.header('Access-Control-Allow-Origin', '*');
    // cabeçalhos permitidos
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    // métodos permitidos no preflight
    if (req.method === 'OPTIONS') {
        res.header(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        );
        return res.sendStatus(200);
    }
    next();
});

// 2) PARSE DE JSON
app.use(express.json());

// 3) ROTAS PÚBLICAS
app.use('/api/auth', authRouter);

// 4) ROTAS PROTEGIDAS
app.use('/api/users', authenticateToken, userRouter);
app.use('/api/categories', authenticateToken, categoryRouter);
app.use('/api/atendimentos', authenticateToken, atendRouter);
app.use('/api/reports', authenticateToken, reportsRouter);

// 5) INICIA O SERVIDOR
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
    console.log(`🚀 Backend rodando na porta ${PORT}`)
);
