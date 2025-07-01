// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// rotas existentes
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const atendRouter = require('./routes/atendimentos');
const categoryRouter = require('./routes/categories');

// nova rota de relatórios
const reportsRouter = require('./routes/reports');

// middleware de autenticação — verifique se o nome bate com o que seu arquivo exporta
// se o seu middleware chama-se verifyToken, troque abaixo para:
//    const { verifyToken } = require('./middleware/auth');
const { authenticate } = require('./middleware/auth');

const app = express();

// middlewares globais
app.use(cors());
app.use(bodyParser.json());

// endpoints públicos
app.use('/api/auth', authRouter);

// endpoints protegidos
app.use('/api/users', authenticate, userRouter);
app.use('/api/categories', authenticate, categoryRouter);
app.use('/api/atendimentos', authenticate, atendRouter);

// **novo** endpoint de relatórios
app.use('/api/reports', authenticate, reportsRouter);

// inicialização
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
    console.log(`🚀 Backend rodando na porta ${PORT}`)
);
