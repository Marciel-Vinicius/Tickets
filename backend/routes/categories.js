// backend/routes/categories.js
const express = require('express');
const { query } = require('../db');
const router = express.Router();

/*
  ⚠️ Garanta no seu banco:
    ALTER TABLE contatos
      ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;
*/

router.get('/', async (req, res) => {
    let lojas = [], contatos = [], ocorrencias = [];

    // busca lojas
    try {
        const { rows } = await query(
            'SELECT nome FROM categorias ORDER BY nome',
            []
        );
        lojas = Array.isArray(rows) ? rows.map(r => r.nome) : [];
    } catch (err) {
        console.error('Erro ao SELECT categorias:', err);
    }

    // busca contatos (com campo ativo)
    try {
        const { rows } = await query(
            'SELECT id, nome, categoria, ativo FROM contatos ORDER BY nome',
            []
        );
        contatos = Array.isArray(rows) ? rows : [];
    } catch (err) {
        console.error('Erro ao SELECT contatos:', err);
    }

    // busca ocorrências
    try {
        const { rows } = await query(
            'SELECT descricao FROM ocorrencias ORDER BY descricao',
            []
        );
        ocorrencias = Array.isArray(rows)
            ? rows.map(r => r.descricao)
            : [];
    } catch (err) {
        console.error('Erro ao SELECT ocorrencias:', err);
    }

    // responde sempre com arrays válidos
    res.json({ lojas, contatos, ocorrencias });
});

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
        console.error('Erro ao inativar contato:', err);
        res.status(500).json({ message: 'Erro ao inativar contato.' });
    }
});

module.exports = router;
