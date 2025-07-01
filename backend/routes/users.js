// src/routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

// GET /api/users
router.get('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT id, username, sector FROM users ORDER BY id'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Erro em GET /api/users:', err);
        res.status(500).json({ error: 'internal_server_error' });
    } finally {
        client.release();
    }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { password, sector } = req.body;
        const hash = await bcrypt.hash(password, 10);
        await client.query(
            'UPDATE users SET password = $1, sector = $2 WHERE id = $3',
            [hash, sector, id]
        );
        res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (err) {
        console.error('Erro em PUT /api/users/:id:', err);
        res.status(500).json({ error: 'internal_server_error' });
    } finally {
        client.release();
    }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'Usuário excluído com sucesso' });
    } catch (err) {
        console.error('Erro em DELETE /api/users/:id:', err);
        res.status(500).json({ error: 'internal_server_error' });
    } finally {
        client.release();
    }
});

module.exports = router;
