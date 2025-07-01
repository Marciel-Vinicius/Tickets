// backend/index.js
require('dotenv').config();
const express = require('express');
const pool = require('./db');               // seu Pool ajustado em db.js
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const atendRouter = require('./routes/atendimentos');
const categoryRouter = require('./routes/categories');
const reportsRouter = require('./routes/reports');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// 1) CORS manual em todas requisições
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // ou coloque aqui seu domínio
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    // para preflight requests
    if (req.method === 'OPTIONS') {
        res.header(
            'Access-Control-Allow-Methods',
            'GET,POST,PUT,PATCH,DELETE,OPTIONS'
        );
        return res.status(200).json({});
    }
    next();
});

// 2) Parser JSON
app.use(express.json()); // igual ao bodyParser.json()

// 3) Rotas públicas e privadas
app.use('/api/auth', authRouter);
app.use('/api/users', authenticateToken, userRouter);
app.use('/api/categories', authenticateToken, categoryRouter);
app.use('/api/atendimentos', authenticateToken, atendRouter);
app.use('/api/reports', authenticateToken, reportsRouter);

// 4) Start
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend rodando na porta ${PORT}`));
