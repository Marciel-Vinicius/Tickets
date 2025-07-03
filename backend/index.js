// backend/index.js
const express = require('express');
const cors = require('cors');
const { authenticateToken, authorizeSector } = require('./middleware/auth');
const atendimentosRouter = require('./routes/atendimentos');
const categoriesRouter = require('./routes/categories');
const usersRouter = require('./routes/users');
const reportRouter = require('./routes/report'); // ou reportDashboard.js, conforme seu projeto

const app = express();

app.use(cors());
app.use(express.json());

// Rotas públicas de login / registro
app.post('/api/login', /* seu handler de login */);
app.post('/api/register', /* seu handler de registro */);

// **Só autenticação** (SAF e DEV podem):
app.use('/api/atendimentos', authenticateToken, atendimentosRouter);
app.use('/api/categories', authenticateToken, categoriesRouter);
app.use('/api/reports', authenticateToken, reportRouter);

// **Somente DEV**:
app.use('/api/users', authenticateToken, authorizeSector(['DEV']), usersRouter);

// Erro 404 / 500 genérico...
app.use((req, res) => res.sendStatus(404));
app.use((err, req, res, next) => {
    console.error(err);
    res.sendStatus(500);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
