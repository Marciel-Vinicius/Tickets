// backend/index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const atendRoutes = require('./routes/atendimentos');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// 1) Habilita CORS globalmente para todas as rotas e origens
app.use(cors());

// 2) Responde a OPTIONS para todas as rotas (preflight)
app.options('*', cors());

// 3) Body parser
app.use(bodyParser.json());

// 4) Rotas
app.use('/api/auth', authRoutes);
app.use('/api/atendimentos', authenticateToken, atendRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/categories', authenticateToken, categoryRoutes);

// 5) Inicia o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
