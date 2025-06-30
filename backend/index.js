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

// 1) Habilita CORS globalmente (todas origens, todos métodos)
app.use(cors());
app.options('*', cors());

// 2) Body parser
app.use(bodyParser.json());

// 3) Rotas
app.use('/api/auth', authRoutes);
app.use('/api/atendimentos', authenticateToken, atendRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/categories', authenticateToken, categoryRoutes);

// 4) Start
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
