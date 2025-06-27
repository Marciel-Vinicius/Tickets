const express = require('express');
const fs = require('fs');
const path = require('path');
const { authorizeSector } = require('../middleware/auth');
const router = express.Router();
const dbFile = path.join(__dirname, '..', 'db.json');

function readDB() {
    return JSON.parse(fs.readFileSync(dbFile));
}
function writeDB(db) {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

const types = ['lojas', 'contatos', 'ocorrencias'];

// todas só DEV
router.use(authorizeSector('DEV'));

// GET todas as categorias
router.get('/', (req, res) => {
    const db = readDB();
    const result = {};
    types.forEach(t => (result[t] = db[t]));
    res.json(result);
});

// POST nova categoria
router.post('/:type', (req, res) => {
    const { type } = req.params;
    const { value } = req.body;
    if (!types.includes(type)) return res.sendStatus(400);
    const db = readDB();
    if (db[type].includes(value)) return res.status(400).json({ message: 'Já existe' });
    db[type].push(value);
    writeDB(db);
    res.status(201).json({ value });
});

// PUT editar
router.put('/:type/:old', (req, res) => {
    const { type, old } = req.params;
    const { value } = req.body;
    if (!types.includes(type)) return res.sendStatus(400);
    const db = readDB();
    const idx = db[type].findIndex(i => i === old);
    if (idx === -1) return res.sendStatus(404);
    db[type][idx] = value;
    writeDB(db);
    res.json({ value });
});

// DELETE
router.delete('/:type/:value', (req, res) => {
    const { type, value } = req.params;
    if (!types.includes(type)) return res.sendStatus(400);
    const db = readDB();
    db[type] = db[type].filter(i => i !== value);
    writeDB(db);
    res.sendStatus(204);
});

module.exports = router;
