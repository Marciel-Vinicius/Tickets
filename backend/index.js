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

// usa FRONTEND_URL do .env ou localhost
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_URL }));

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/atendimentos', authenticateToken, atendRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/categories', authenticateToken, categoryRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
