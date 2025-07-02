// backend/routes/categories.js
const express = require('express');
const { authorizeSector } = require('../middleware/auth');
const { query } = require('../db');

const router = express.Router();
const types = ['lojas', 'contatos', 'ocorrencias'];

router.use(authorizeSector('DEV'));

// GET todas (apenas ativas para lojas e contatos)
router.get('/', async (req, res) => {
    const result = {};
    for (let t of types) {
        let rows;
        if (t === 'lojas' || t === 'contatos') {
            ({ rows } = await query(
                `SELECT value FROM ${t} WHERE active = true ORDER BY value`,
                []
            ));
        } else {
            ({ rows } = await query(
                `SELECT value FROM ${t} ORDER BY value`,
                []
            ));
        }
        result[t] = rows.map(r => r.value);
    }
    res.json(result);
});

// POST criar
router.post('/:type', async (req, res) => {
    const { type } = req.params;
    const { value } = req.body;
    if (!types.includes(type)) return res.sendStatus(400);
    await query(`INSERT INTO ${type}(value) VALUES($1)`, [value]);
    res.status(201).json({ value });
});

// PUT atualizar valor
router.put('/:type/:old', async (req, res) => {
    const { type, old } = req.params;
    const { value } = req.body;
    if (!types.includes(type)) return res.sendStatus(400);
    await query(`UPDATE ${type} SET value=$1 WHERE value=$2`, [value, old]);
    res.json({ value });
});

// PATCH inativar (marcar active = false)
router.patch('/:type/:value/inactivate', async (req, res) => {
    const { type, value } = req.params;
    if (!types.includes(type) || (type !== 'lojas' && type !== 'contatos')) {
        return res.sendStatus(400);
    }
    await query(`UPDATE ${type} SET active = false WHERE value = $1`, [value]);
    res.sendStatus(204);
});

module.exports = router;
