const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { authorizeSector } = require('../middleware/auth');
const router = express.Router();
const dbFile = path.join(__dirname, '..', 'db.json');

function readDB() {
    return JSON.parse(fs.readFileSync(dbFile));
}
function writeDB(db) {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

router.use(authorizeSector('DEV'));

// Listar usuários (sem senha)
router.get('/', (req, res) => {
    const db = readDB();
    const users = db.users.map(u => ({ username: u.username, sector: u.sector }));
    res.json(users);
});

// Atualizar setor e/ou senha
router.put('/:username', (req, res) => {
    const { username } = req.params;
    const { sector, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.username === username);
    if (!user) return res.sendStatus(404);
    if (sector) user.sector = sector;
    if (password) user.password = bcrypt.hashSync(password, 8);
    writeDB(db);
    res.json({ username: user.username, sector: user.sector });
});

module.exports = router;
