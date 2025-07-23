// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../db');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'MY_SECRET';

// Rota de registro
router.post('/register', async (req, res) => {
  const { username, password, sector } = req.body;
  if (!username || !password || !sector) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }
  try {
    // Verifica existência
    const { rowCount } = await query(
      'SELECT 1 FROM users WHERE username = $1',
      [username]
    );
    if (rowCount > 0) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }
    // Insere com hash
    const hash = bcrypt.hashSync(password, 8);
    await query(
      'INSERT INTO users(username, password, sector) VALUES($1, $2, $3)',
      [username, hash, sector]
    );
    return res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (err) {
    console.error('Erro no register:', err);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username e senha são obrigatórios' });
  }
  try {
    // Busca senha, setor e initial_saturdays
    const { rows } = await query(
      'SELECT password, sector, initial_saturdays FROM users WHERE username = $1',
      [username]
    );
    if (
      rows.length === 0 ||
      !bcrypt.compareSync(password, rows[0].password)
    ) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    const { sector, initial_saturdays } = rows[0];
    // Gera token incluindo initial_saturdays
    const token = jwt.sign(
      { username, sector, initial_saturdays },
      SECRET,
      { expiresIn: '24h' }
    );
    // Retorna token e dados do usuário (sem senha)
    return res.json({
      token,
      user: { username, sector, initial_saturdays }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

module.exports = router;
