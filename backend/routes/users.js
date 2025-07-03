// backend/routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db');
const { authenticateToken, authorizeSector } = require('../middleware/auth');
const router = express.Router();

// Só quem estiver autenticado **e** for do setor DEV:
//  - pode listar, criar, editar e apagar usuários
router.use(authenticateToken);
router.use(authorizeSector(['DEV']));

/**
 * GET /api/users
 * Lista todos os usuários (excluindo senha no retorno)
 */
router.get('/', async (req, res) => {
    try {
        const { rows } = await query(
            `SELECT id, username, sector
         FROM users
       ORDER BY username`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao listar usuários.' });
    }
});

/**
 * POST /api/users
 * Cria novo usuário
 */
router.post('/', async (req, res) => {
    try {
        const { username, password, sector } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const id = uuidv4();
        const { rows } = await query(
            `INSERT INTO users(id, username, password, sector)
       VALUES($1,$2,$3,$4)
       RETURNING id, username, sector`,
            [id, username, hashed, sector]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao criar usuário.' });
    }
});

/**
 * PUT /api/users/:id
 * Atualiza username ou sector de um usuário
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, sector, password } = req.body;

        // Se veio senha, faz hash
        let hashedPart = '';
        const params = [username, sector];
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            hashedPart = ', password = $3';
            params.push(hashed);
        }
        // o último parâmetro sempre será o id
        params.push(id);

        const { rows, rowCount } = await query(
            `UPDATE users
         SET username = $1,
             sector   = $2
             ${hashedPart}
       WHERE id = $${params.length}
       RETURNING id, username, sector`,
            params
        );
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar usuário.' });
    }
});

/**
 * DELETE /api/users/:id
 * Remove um usuário
 */
router.delete('/:id', async (req, res) => {
    try {
        await query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao deletar usuário.' });
    }
});

module.exports = router;
