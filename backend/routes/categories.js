// backend/routes/categories.js
const express = require('express');
const { authorizeSector } = require('../middleware/auth');
const { query } = require('../db');

const router = express.Router();
const types = ['lojas', 'contatos', 'ocorrencias'];

// Antes era authorizeSector('DEV')
// Agora SAF tem acesso (e DEV continua master)
router.use(authorizeSector('SAF'));

// GET todas (por padrão, somente contatos ativos)
router.get('/', async (req, res) => {
    const result = {};
    for (let t of types) {
        if (t === 'contatos') {
            const { rows } = await query(
                'SELECT * FROM contatos WHERE active = true ORDER BY value',
                []
            );
            result[t] = rows;
        } else {
            const { rows } = await query(
                `SELECT * FROM ${t} ORDER BY value`,
                []
            );
            result[t] = rows;
        }
    }
    res.json(result);
});

// POST – criar um novo item de categoria
router.post('/:type', async (req, res) => {
    const { type } = req.params;
    const { value } = req.body;
    if (!types.includes(type)) return res.sendStatus(400);
    await query(
        `INSERT INTO ${type}(value) VALUES($1)`,
        [value]
    );
    res.sendStatus(201);
});

// PUT – renomear
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

// NOVA ROTA – inativar contato
router.put('/:type/:value/inativar', async (req, res) => {
    const { type, value } = req.params;
    // só contatos têm campo active
    if (type !== 'contatos') return res.sendStatus(400);
    await query(
        'UPDATE contatos SET active = false WHERE value = $1',
        [value]
    );
    res.sendStatus(204);
});

// DELETE
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
