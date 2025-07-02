// backend/routes/categories.js
const express = require('express');
const { authorizeSector } = require('../middleware/auth');
const { query } = require('../db');

const router = express.Router();
const types = ['lojas', 'contatos', 'ocorrencias'];

router.use(authorizeSector('DEV'));

// GET todas
router.get('/', async (req, res) => {
    const result = {};
    for (let t of types) {
        const { rows } = await query(`SELECT value FROM ${t} ORDER BY value`, []);
        result[t] = rows.map(r => r.value);
    }
    res.json(result);
});

// POST nova
router.post('/:type', async (req, res) => {
    const { type } = req.params;
    const { value } = req.body;
    if (!types.includes(type)) return res.sendStatus(400);
    await query(`INSERT INTO ${type}(value) VALUES($1)`, [value]);
    res.status(201).json({ value });
});

// PUT editar
router.put('/:type/:old', async (req, res) => {
    const { type, old } = req.params;
    const { value } = req.body;
    if (!types.includes(type)) return res.sendStatus(400);
    await query(`UPDATE ${type} SET value=$1 WHERE value=$2`, [value, old]);
    res.json({ value });
});

// DELETE
router.delete('/:type/:value', async (req, res) => {
    const { type, value } = req.params;
    if (!types.includes(type)) return res.sendStatus(400);
    await query(`DELETE FROM ${type} WHERE value=$1`, [value]);
    res.sendStatus(204);
});

module.exports = router;
// Criar