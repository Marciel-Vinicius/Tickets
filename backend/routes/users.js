// backend/routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
// importa os dois middlewares do auth.js
const { authenticate, authorizeSector } = require('../middleware/auth');
const { query } = require('../db');

const router = express.Router();

// **ordem:** primeiro autentica, depois autoriza só DEV
router.use(authenticate);
router.use(authorizeSector('DEV'));

// Listar usuários + cálculo de sábados (contagem distinta + override)
router.get('/', async (req, res) => {
    const sql = `
    SELECT
      u.username,
      u.sector,
      u.initial_saturdays,
      COALESCE(
        COUNT(DISTINCT a.dia) FILTER (
          WHERE EXTRACT(DOW FROM a.dia) = 6
        ),
        0
      ) + u.initial_saturdays AS saturday_count
    FROM users u
    LEFT JOIN atendimentos a
      ON a.atendente = u.username
    GROUP BY u.username, u.sector, u.initial_saturdays
    ORDER BY u.username
  `;
    try {
        const { rows } = await query(sql, []);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao listar usuários:', err);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// Criar usuário (initial_saturdays padrão 0 via migração)
router.post('/', async (req, res) => {
    const { username, sector, password } = req.body;
    if (!username || !sector || !password) {
        return res.status(400).json({ error: 'username, sector e password são obrigatórios' });
    }
    try {
        const hash = bcrypt.hashSync(password, 8);
        await query(
            'INSERT INTO users(username, sector, password) VALUES($1, $2, $3)',
            [username, sector, hash]
        );
        res.sendStatus(201);
    } catch (err) {
        console.error('Erro ao criar usuário:', err);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// Atualizar setor, senha e initial_saturdays
router.put('/:username', async (req, res) => {
    const { username } = req.params;
    const { sector, password, initial_saturdays } = req.body;
    try {
        if (sector) {
            await query('UPDATE users SET sector=$1 WHERE username=$2', [sector, username]);
        }
        if (password) {
            const hash = bcrypt.hashSync(password, 8);
            await query('UPDATE users SET password=$1 WHERE username=$2', [hash, username]);
        }
        if (initial_saturdays !== undefined) {
            const n = parseInt(initial_saturdays, 10) || 0;
            await query(
                'UPDATE users SET initial_saturdays=$1 WHERE username=$2',
                [n, username]
            );
        }
        const { rows } = await query(
            'SELECT username, sector, initial_saturdays FROM users WHERE username=$1',
            [username]
        );
        if (rows.length === 0) {
            return res.sendStatus(404);
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// Apagar usuário
router.delete('/:username', async (req, res) => {
    const { username } = req.params;
    try {
        await query('DELETE FROM users WHERE username=$1', [username]);
        res.sendStatus(204);
    } catch (err) {
        console.error('Erro ao apagar usuário:', err);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

module.exports = router;
