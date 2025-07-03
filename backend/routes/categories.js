const express = require('express');
const { query } = require('../db');
const router = express.Router();

/*
  ⚠️ Antes de usar:
  Assegure-se de ter rodado no PostgreSQL:
    ALTER TABLE contatos ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT TRUE;
*/

// GET /api/categories
// — Retorna lojas (nomes), contatos (com campo ativo) e ocorrências
router.get('/', async (req, res) => {
    try {
        const { rows: lojasRows } = await query(
            'SELECT nome FROM categorias ORDER BY nome',
            []
        );
        const { rows: contatosRows } = await query(
            'SELECT id, nome, categoria, ativo FROM contatos ORDER BY nome',
            []
        );
        const { rows: ocorrenciasRows } = await query(
            'SELECT descricao FROM ocorrencias ORDER BY descricao',
            []
        );

        const lojas = Array.isArray(lojasRows)
            ? lojasRows.map(r => r.nome)
            : [];
        const contatos = Array.isArray(contatosRows)
            ? contatosRows
            : [];
        const ocorrencias = Array.isArray(ocorrenciasRows)
            ? ocorrenciasRows.map(r => r.descricao)
            : [];

        res.json({ lojas, contatos, ocorrencias });
    } catch (err) {
        console.error('Erro GET /api/categories:', err);
        res.status(500).json({ message: 'Erro ao carregar categorias.' });
    }
});

// PATCH /api/categories/contatos/:id/inactivate
// — Marca um contato como inativo
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
        console.error('Erro PATCH /api/categories/contatos/:id/inactivate:', err);
        res.status(500).json({ message: 'Erro ao inativar contato.' });
    }
});

module.exports = router;
