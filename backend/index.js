// backend/index.js
const express = require('express');
const cors = require('cors');

// rotas
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
const atendimentosRouter = require('./routes/atendimentos');
const reportsRouter = require('./routes/reports');

const { authenticate } = require('./middleware/auth');

const app = express();

// Configure CORS para permitir seu frontend acessar a API
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://tickets-frontend-kvf1.onrender.com';
app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// → rotas públicas de auth (login/register/logout-all)
app.use('/api/auth', authRouter);

// → aplica autenticação em todas as rotas abaixo
app.use(authenticate);

// → rotas protegidas
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/atendimentos', atendimentosRouter);

// → rotas de relatórios
app.use('/api/reports', reportsRouter);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
});
