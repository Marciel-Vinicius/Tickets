// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../db');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'MY_SECRET';

router.post('/register', async (req, res) => {
  const { username, password, sector } = req.body;
  if (!username || !password || !sector)
    return res.status(400).json({ message: 'Dados incompletos' });

  const { rowCount } = await query('SELECT 1 FROM users WHERE username=$1', [username]);
  if (rowCount > 0)
    return res.status(400).json({ message: 'Usuário já existe' });

  const hash = bcrypt.hashSync(password, 8);
  await query('INSERT INTO users(username,password,sector) VALUES($1,$2,$3)', [
    username, hash, sector
  ]);

  res.status(201).json({ message: 'Usuário criado com sucesso' });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const { rows } = await query('SELECT password, sector FROM users WHERE username=$1', [username]);
  if (rows.length === 0 || !bcrypt.compareSync(password, rows[0].password)) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  const token = jwt.sign(
    { username, sector: rows[0].sector },
    SECRET,
    { expiresIn: '1h' }
  );
  res.json({ token });
});

module.exports = router;

// Criar