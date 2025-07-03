const express = require('express');
const cors = require('cors');

const { authenticateToken } = require('./middlewares/authenticate');
const atendimentosRouter = require('./routes/atendimentos');
const categoriesRouter = require('./routes/categories');
const usersRouter = require('./routes/users');
// importe aqui outras rotas, se houver

const app = express();
app.use(cors());
app.use(express.json());

// Rotas públicas (login, registro etc.)
// app.use('/api/auth', authRouter);

// Rotas protegidas
app.use('/api/atendimentos', authenticateToken, atendimentosRouter);
app.use('/api/categories', authenticateToken, categoriesRouter);
app.use('/api/users', authenticateToken, usersRouter);
// adicione aqui outras linhas app.use para suas demais rotas

// Handler genérico de erros
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Erro interno no servidor.' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
});
