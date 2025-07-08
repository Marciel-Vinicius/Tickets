// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-superseguro'; // Troque em produção!

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Ajuste o nome do campo se necessário!
  const { rows } = await query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
  const user = rows[0];
  if (!user) {
    return res.status(401).json({ message: 'Usuário ou senha inválidos' });
  }

  // Retorne apenas campos seguros no token!
  const token = jwt.sign({
    id: user.id,
    username: user.nome,
    email: user.email,
    sector: user.sector
  }, JWT_SECRET, { expiresIn: '8h' });

  res.json({ token });
});

module.exports = router;
