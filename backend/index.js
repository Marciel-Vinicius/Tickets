// backend/index.js
const express = require('express');
const cors = require('cors');

// rotas
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
const atendimentosRouter = require('./routes/atendimentos');
const reportsRouter = require('./routes/reports'); // ← importe aqui

const { authenticate } = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

// → rotas públicas de auth (login/register)
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
