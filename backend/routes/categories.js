const express = require('express');
const { authorizeSector } = require('../middleware/auth');
const { query } = require('../db');

const router = express.Router();
const types = ['lojas', 'contatos', 'ocorrencias'];

router.use(authorizeSector('SAF'));

// GET todas (por padrão, somente contatos ativos)
router.get('/', async (req, res) => {
    const result = {};
    for (let t of types) {
        if (t === 'contatos') {
            const { rows } = await query(
                'SELECT id, value FROM contatos WHERE active = true ORDER BY value',
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

// PUT – editar item de categoria
router.put('/:type/:oldValue', async (req, res) => {
    const { type, oldValue } = req.params;
    const { value } = req.body;
    if (!types.includes(type)) return res.sendStatus(400);
    await query(
        `UPDATE ${type} SET value = $1 WHERE value = $2`,
        [value, oldValue]
    );
    res.sendStatus(200);
});

// DELETE – deletar item de categoria
router.delete('/:type/:value', async (req, res) => {
    const { type, value } = req.params;
    if (!types.includes(type)) return res.sendStatus(400);
    await query(
        `DELETE FROM ${type} WHERE value = $1`,
        [value]
    );
    res.sendStatus(200);
});

// PUT /api/categories/contatos/:id → inativar contato
router.put('/contatos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await query(
            'UPDATE contatos SET active = false WHERE id = $1',
            [id]
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = router;
