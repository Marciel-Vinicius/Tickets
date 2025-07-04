// backend/routes/users.js
const express = require('express');
const { query } = require('../db');
const { authenticateToken, authorizeSector } = require('../middleware/auth');

const router = express.Router();

// Autentica e só permite setor DEV
router.use(authenticateToken);
router.use(authorizeSector(['DEV']));

router.get('/', async (req, res) => {
    try {
        const { rows } = await query(
            `SELECT id, username, sector FROM users ORDER BY username`,
            []
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao listar usuários.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { username, password, sector } = req.body;
        const result = await query(
            `INSERT INTO users (username, password, sector)
       VALUES ($1, crypt($2, gen_salt('bf')), $3)
       RETURNING id, username, sector`,
            [username, password, sector]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao criar usuário.' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, sector } = req.body;
        const result = await query(
            `UPDATE users
       SET username=$1,
           password = CASE WHEN $2 <> '' THEN crypt($2, gen_salt('bf')) ELSE password END,
           sector=$3
       WHERE id = $4
       RETURNING id, username, sector`,
            [username, password, sector, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar usuário.' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao excluir usuário.' });
    }
});

module.exports = router;
