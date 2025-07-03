// backend/index.js
const express = require('express');
const cors = require('cors');
const { authenticateToken, authorizeSector } = require('./middleware/auth');
const atendimentosRouter = require('./routes/atendimentos');
const categoriesRouter = require('./routes/categories');
const usersRouter = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas públicas
app.post('/api/login', /* seu handler de login */);
app.post('/api/register', /* seu handler de registro */);

// Rotas protegidas (DEV e SAF)
app.use('/api/atendimentos', authenticateToken, atendimentosRouter);
app.use('/api/categories', authenticateToken, categoriesRouter);

// Rotas de usuário só para DEV
app.use('/api/users', authenticateToken, authorizeSector(['DEV']), usersRouter);

// Handler 404
app.use((req, res) => res.sendStatus(404));

// Handler de erros
app.use((err, req, res, next) => {
    console.error(err);
    res.sendStatus(500);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
