const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const SECRET = 'MY_SECRET';
const dbFile = path.join(__dirname, '..', 'db.json');

function readDB() {
  return JSON.parse(fs.readFileSync(dbFile));
}
function writeDB(db) {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

// Registro de usuário com setor
router.post('/register', (req, res) => {
  const { username, password, sector } = req.body;
  if (!username || !password || !sector)
    return res.status(400).json({ message: 'Dados incompletos' });
  const db = readDB();
  if (db.users.find(u => u.username === username))
    return res.status(400).json({ message: 'Usuário já existe' });
  const hash = bcrypt.hashSync(password, 8);
  db.users.push({ username, password: hash, sector });
  writeDB(db);
  res.status(201).json({ message: 'Usuário criado com sucesso' });
});

// Login retorna token com setor
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: 'Credenciais inválidas' });
  const token = jwt.sign({ username: user.username, sector: user.sector }, SECRET, {
    expiresIn: '1h'
  });
  res.json({ token });
});

module.exports = router;
