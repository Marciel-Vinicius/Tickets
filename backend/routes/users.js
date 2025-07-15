// backend/routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
// mantém seu import original, agora incluindo authenticate
const { authenticate, authorizeSector } = require('../middleware/auth');
const { query } = require('../db');

const router = express.Router();

// primeiro autentica, depois verifica setor DEV
router.use(authenticate);
router.use(authorizeSector('DEV'));

// Listar
router.get('/', async (req, res) => {
    const { rows } = await query('SELECT username, sector FROM users', []);
    res.json(rows);
});

// Atualizar setor e/ou senha
router.put('/:username', async (req, res) => {
    const { username } = req.params;
    const { sector, password } = req.body;

    if (sector) {
        await query('UPDATE users SET sector=$1 WHERE username=$2', [sector, username]);
    }
    if (password) {
        const hash = bcrypt.hashSync(password, 8);
        await query('UPDATE users SET password=$1 WHERE username=$2', [hash, username]);
    }

    const { rows } = await query(
        'SELECT username, sector FROM users WHERE username=$1',
        [username]
    );
    if (rows.length === 0) return res.sendStatus(404);
    res.json(rows[0]);
});

module.exports = router;
