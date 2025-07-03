// backend/routes/categories.js
const express = require('express');
const { query } = require('../db');
const router = express.Router();

/*
  Antes de usar essas rotas, adicione na sua base PostgreSQL:
    ALTER TABLE contatos ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT TRUE;
*/

// GET /api/categories
// Retorna categorias, contatos (com campo ativo) e ocorrências
router.get('/', async (req, res) => {
    try {
        const { rows: lojas } = await query(
            'SELECT nome FROM categorias ORDER BY nome',
            []
        );
        const { rows: contatos } = await query(
            'SELECT id, nome, categoria, ativo FROM contatos ORDER BY nome',
            []
        );
        const { rows: ocorrencias } = await query(
            'SELECT descricao FROM ocorrencias ORDER BY descricao',
            []
        );
        res.json({
            lojas: lojas.map(r => r.nome),
            contatos: contatos,           // array de { id, nome, categoria, ativo }
            ocorrencias: ocorrencias.map(r => r.descricao)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao carregar categorias.' });
    }
});

// PATCH /api/categories/contatos/:id/inactivate
// Marca um contato como inativo
router.patch('/contatos/:id/inactivate', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'UPDATE contatos SET ativo = FALSE WHERE id = $1 RETURNING id, nome, categoria, ativo',
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Contato não encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao inativar contato.' });
    }
});

module.exports = router;
