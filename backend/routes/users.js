// backend/routes/users.js
const express = require('express');
const { query } = require('../db');
const authorizeSector = require('../middleware/authorizeSector');
const router = express.Router();

// Apenas DEV pode acessar rotas de usuários
router.use(authorizeSector(['DEV']));

// Listar usuários
router.get('/', async (req, res) => {
    const { rows } = await query('SELECT * FROM users', []);
    res.json(rows);
});

// Criar usuário
router.post('/', async (req, res) => {
    const { nome, email, password, sector } = req.body;
    await query(
        'INSERT INTO users (nome, email, password, sector) VALUES ($1, $2, $3, $4)',
        [nome, email, password, sector]
    );
    res.status(201).json({ message: 'Usuário criado com sucesso' });
});

// Editar usuário
router.put('/:id', async (req, res) => {
    const { nome, email, sector } = req.body;
    await query(
        'UPDATE users SET nome = $1, email = $2, sector = $3 WHERE id = $4',
        [nome, email, sector, req.params.id]
    );
    res.json({ message: 'Usuário atualizado com sucesso' });
});

// Excluir usuário
router.delete('/:id', async (req, res) => {
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'Usuário excluído com sucesso' });
});

module.exports = router;
