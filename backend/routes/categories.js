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
    try {
        const result = {};
        for (let t of types) {
            let sql;
            if (t === 'contatos') {
                // só traz contatos com flag active
                sql = 'SELECT value, active FROM contatos ORDER BY value';
            } else {
                sql = `SELECT value FROM ${t} ORDER BY value`;
            }
            const r = await query(sql, []);
            result[t] = (t === 'contatos')
                ? r.rows
                : r.rows.map(row => row.value);
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// POST – inserir nova categoria
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

// PUT – renomear categoria
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

// PUT – inativar contato
router.put('/:type/:value/inativar', async (req, res) => {
    const { type, value } = req.params;
    // só aplicável a contatos
    if (type !== 'contatos') return res.sendStatus(400);
    await query(
        `UPDATE contatos SET active = FALSE WHERE value = $1`,
        [value]
    );
    res.json({ value });
});

// DELETE – remove completamente
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
