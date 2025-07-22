// backend/routes/categories.js
const express = require('express');
const { authorizeSector } = require('../middleware/auth');
const { query } = require('../db');

const router = express.Router();
const types = ['lojas', 'contatos', 'ocorrencias'];

// Ajuste quem pode acessar (mantive 'SAF'; acrescente 'DEV' se precisar)
router.use(authorizeSector('SAF'));

// GET /api/categories
// → { lojas: [...], contatos: [...], ocorrencias: [...] }
router.get('/', async (req, res) => {
    try {
        const result = {};
        for (let t of types) {
            if (t === 'contatos') {
                const { rows } = await query(
                    'SELECT value, active FROM contatos WHERE active = true ORDER BY value',
                    []
                );
                result[t] = rows;
            } else {
                const { rows } = await query(
                    `SELECT value FROM ${t} ORDER BY value`,
                    []
                );
                result[t] = rows.map(r => r.value);
            }
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// POST /api/categories/:type
// → criar item em lojas, contatos ou ocorrencias
router.post('/:type', async (req, res) => {
    const { type } = req.params;
    const { value } = req.body;
    if (!types.includes(type) || !value) return res.sendStatus(400);
    try {
        await query(`INSERT INTO ${type}(value) VALUES($1)`, [value]);
        res.sendStatus(201);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// PUT /api/categories/:type/:oldValue
// → renomear item (lojas, contatos e ocorrencias)
router.put('/:type/:oldValue', async (req, res) => {
    const { type, oldValue } = req.params;
    const { value } = req.body;
    if (!types.includes(type) || !value) return res.sendStatus(400);
    try {
        await query(
            `UPDATE ${type} SET value = $1 WHERE value = $2`,
            [value, oldValue]
        );
        res.json({ value });
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// PUT /api/categories/contatos/:value/inativar
// → só para contatos: marca active = false
router.put('/:type/:value/inativar', async (req, res) => {
    const { type, value } = req.params;
    if (type !== 'contatos') return res.sendStatus(400);
    try {
        await query(
            'UPDATE contatos SET active = false WHERE value = $1',
            [value]
        );
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// DELETE /api/categories/:type/:value
// → remove o item
router.delete('/:type/:value', async (req, res) => {
    const { type, value } = req.params;
    if (!types.includes(type)) return res.sendStatus(400);
    try {
        await query(`DELETE FROM ${type} WHERE value = $1`, [value]);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = router;
