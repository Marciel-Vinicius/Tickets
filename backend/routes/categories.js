// src/routes/categories.js
const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT id, name FROM categories ORDER BY name'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Erro em GET /api/categories:', err);
        res.status(500).json({ error: 'internal_server_error' });
    } finally {
        client.release();
    }
});

// POST /api/categories
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const { name } = req.body;
        await client.query(
            'INSERT INTO categories (name) VALUES ($1)',
            [name]
        );
        res.status(201).json({ message: 'Categoria criada com sucesso' });
    } catch (err) {
        console.error('Erro em POST /api/categories:', err);
        res.status(500).json({ error: 'internal_server_error' });
    } finally {
        client.release();
    }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { name } = req.body;
        await client.query(
            'UPDATE categories SET name = $1 WHERE id = $2',
            [name, id]
        );
        res.json({ message: 'Categoria atualizada com sucesso' });
    } catch (err) {
        console.error('Erro em PUT /api/categories/:id:', err);
        res.status(500).json({ error: 'internal_server_error' });
    } finally {
        client.release();
    }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('DELETE FROM categories WHERE id = $1', [id]);
        res.json({ message: 'Categoria excluída com sucesso' });
    } catch (err) {
        console.error('Erro em DELETE /api/categories/:id:', err);
        res.status(500).json({ error: 'internal_server_error' });
    } finally {
        client.release();
    }
});

module.exports = router;
