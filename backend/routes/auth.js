// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, password } = req.body;
    const result = await client.query(
      'SELECT id, username, password, sector FROM users WHERE username = $1',
      [username]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const token = jwt.sign(
      { username: user.username, sector: user.sector },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token });
  } catch (err) {
    console.error('Erro em POST /api/auth/login:', err);
    res.status(500).json({ error: 'internal_server_error' });
  } finally {
    client.release();
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, password, sector } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await client.query(
      'INSERT INTO users (username, password, sector) VALUES ($1, $2, $3)',
      [username, hash, sector]
    );
    res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
  } catch (err) {
    console.error('Erro em POST /api/auth/register:', err);
    res.status(500).json({ error: 'internal_server_error' });
  } finally {
    client.release();
  }
});

module.exports = router;
