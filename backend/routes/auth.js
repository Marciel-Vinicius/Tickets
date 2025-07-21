// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { authenticate, authorizeSector } = require('../middleware/auth');

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  const { username, sector, password } = req.body;
  if (!username || !sector || !password) return res.sendStatus(400);
  const hash = bcrypt.hashSync(password, 8);
  await query(
    'INSERT INTO users(username, sector, password) VALUES($1,$2,$3)',
    [username, sector, hash]
  );
  res.sendStatus(201);
});

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const { rows } = await query(
    'SELECT username, password, sector FROM users WHERE username = $1',
    [username]
  );
  if (rows.length === 0) return res.status(400).json({ message: 'Usuário não existe' });
  const user = rows[0];
  if (!bcrypt.compareSync(password, user.password))
    return res.status(400).json({ message: 'Senha incorreta' });
  const token = jwt.sign(
    { username: user.username, sector: user.sector },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token });
});

// LOGOUT-ALL (força logout de todos os tokens emitidos até agora)
router.post(
  '/logout-all',
  authenticate,
  authorizeSector('DEV'),
  async (req, res) => {
    // só Marciel pode disparar
    if (req.user.username !== 'Marciel') return res.sendStatus(403);
    await query('UPDATE users SET logout_all_at = NOW()', []);
    res.json({ message: 'Todos os usuários foram desconectados.' });
  }
);

module.exports = router;
