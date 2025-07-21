// backend/routes/categories.js
const express = require('express');
const { authorizeSector } = require('../middleware/auth');
const { query } = require('../db');

const router = express.Router();
const types = ['lojas', 'contatos', 'ocorrencias'];

// Autorização: DEV e SAF podem mexer em categorias
router.use(authorizeSector('SAF'));

// GET /api/categories
// Retorna um objeto com 3 arrays: lojas (strings), contatos ({ value, active }), ocorrencias (strings)
router.get('/', async (req, res) => {
    try {
        const result = {};
        for (let type of types) {
            if (type === 'contatos') {
                const r = await query(
                    'SELECT value, active FROM contatos ORDER BY value',
                    []
                );
                result[type] = r.rows;
            } else {
                const r = await query(
                    `SELECT value FROM ${type} ORDER BY value`,
                    []
                );
                result[type] = r.rows.map(row => row.value);
            }
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// POST   /api/categories/:type       → cria novo valor
// PUT    /api/categories/:type       → renomeia (body: { old, value })
// PUT    /api/categories/contatos/:value/inativar
// DELETE /api/categories/:type/:value
router.post('/:type', async (req, res) => {
    const { type } = req.params;
    const { value } = req.body;
    if (!types.includes(type)) return res.sendStatus(400);
    await query(`INSERT INTO ${type}(value) VALUES($1)`, [value]);
    res.sendStatus(201);
});

router.put('/:type', async (req, res) => {
    const { type } = req.params;
    const { old, value } = req.body;
    if (!types.includes(type)) return res.sendStatus(400);
    await query(
        `UPDATE ${type} SET value=$1 WHERE value=$2`,
        [value, old]
    );
    res.json({ value });
});

router.put('/:type/:value/inativar', async (req, res) => {
    const { type, value } = req.params;
    if (type !== 'contatos') return res.sendStatus(400);
    await query(
        `UPDATE contatos SET active = FALSE WHERE value = $1`,
        [value]
    );
    res.json({ value });
});

router.delete('/:type/:value', async (req, res) => {
    const { type, value } = req.params;
    if (!types.includes(type)) return res.sendStatus(400);
    await query(
        `DELETE FROM ${type} WHERE value=$1`,
        [value]
    );
    res.sendStatus(204);
});

module.exports = router;
