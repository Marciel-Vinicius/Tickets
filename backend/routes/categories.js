// backend/src/routes/categories.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /api/categories?type=loja|contato|ocorrencia
router.get('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const { type } = req.query;
        if (!type || !['loja', 'contato', 'ocorrencia'].includes(type)) {
            return res.status(400).json({ error: 'query param `type` inválido' });
        }
        const result = await client.query(
            'SELECT id, name FROM categories WHERE type = $1 ORDER BY name',
            [type]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Erro GET /api/categories:', err);
        res.status(500).json({ error: 'internal_server_error' });
    } finally {
        client.release();
    }
});

// POST /api/categories
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const { name, type } = req.body;
        if (!['loja', 'contato', 'ocorrencia'].includes(type)) {
            return res.status(400).json({ error: 'type inválido' });
        }
        await client.query(
            'INSERT INTO categories (name, type) VALUES ($1,$2)',
            [name, type]
        );
        res.status(201).json({ message: 'Categoria criada' });
    } catch (err) {
        console.error('Erro POST /api/categories:', err);
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
        await client.query('UPDATE categories SET name=$1 WHERE id=$2', [name, id]);
        res.json({ message: 'Categoria atualizada' });
    } catch (err) {
        console.error('Erro PUT /api/categories/:id:', err);
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
        await client.query('DELETE FROM categories WHERE id=$1', [id]);
        res.json({ message: 'Categoria excluída' });
    } catch (err) {
        console.error('Erro DELETE /api/categories/:id:', err);
        res.status(500).json({ error: 'internal_server_error' });
    } finally {
        client.release();
    }
});

module.exports = router;
