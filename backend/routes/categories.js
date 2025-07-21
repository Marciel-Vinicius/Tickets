// backend/routes/categories.js
const express = require('express');
const { authenticate, authorizeSector } = require('../middleware/auth');
const { query } = require('../db');

const router = express.Router();

// → Aplica autenticação e só quem estiver no setor DEV pode mexer em categorias
router.use(authenticate);
router.use(authorizeSector('DEV'));

// GET /api/categories
// Retorna as três listas: lojas, contatos (com flag active) e ocorrências
router.get('/', async (req, res) => {
    try {
        const lojasRes = await query('SELECT value FROM lojas ORDER BY value', []);
        const contatosRes = await query('SELECT value, active FROM contatos ORDER BY value', []);
        const ocorrenciasRes = await query('SELECT value FROM ocorrencias ORDER BY value', []);

        const lojas = lojasRes.rows.map(r => r.value);
        const contatos = contatosRes.rows.map(r => ({ value: r.value, active: r.active }));
        const ocorrencias = ocorrenciasRes.rows.map(r => r.value);

        res.json({ lojas, contatos, ocorrencias });
    } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        res.status(500).json({ error: 'Erro ao buscar categorias.' });
    }
});

//
// ROTAS DE LOJAS
//

// Criar loja
router.post('/lojas', async (req, res) => {
    const { value } = req.body;
    try {
        await query('INSERT INTO lojas(value) VALUES($1)', [value]);
        res.sendStatus(201);
    } catch (err) {
        console.error('Erro ao criar loja:', err);
        res.status(500).json({ error: 'Erro ao criar loja.' });
    }
});

// Atualizar loja
router.put('/lojas/:oldValue', async (req, res) => {
    const { oldValue } = req.params;
    const { value } = req.body;
    try {
        await query('UPDATE lojas SET value = $1 WHERE value = $2', [value, oldValue]);
        res.json({ value });
    } catch (err) {
        console.error('Erro ao atualizar loja:', err);
        res.status(500).json({ error: 'Erro ao atualizar loja.' });
    }
});

// Deletar loja
router.delete('/lojas/:value', async (req, res) => {
    const { value } = req.params;
    try {
        await query('DELETE FROM lojas WHERE value = $1', [value]);
        res.sendStatus(204);
    } catch (err) {
        console.error('Erro ao apagar loja:', err);
        res.status(500).json({ error: 'Erro ao apagar loja.' });
    }
});

//
// ROTAS DE CONTATOS
//

// Criar contato
router.post('/contatos', async (req, res) => {
    const { value } = req.body;
    try {
        // por padrão já cadastra como active = true
        await query('INSERT INTO contatos(value, active) VALUES($1, true)', [value]);
        res.sendStatus(201);
    } catch (err) {
        console.error('Erro ao criar contato:', err);
        res.status(500).json({ error: 'Erro ao criar contato.' });
    }
});

// Atualizar contato
router.put('/contatos/:oldValue', async (req, res) => {
    const { oldValue } = req.params;
    const { value } = req.body;
    try {
        await query('UPDATE contatos SET value = $1 WHERE value = $2', [value, oldValue]);
        res.json({ value });
    } catch (err) {
        console.error('Erro ao atualizar contato:', err);
        res.status(500).json({ error: 'Erro ao atualizar contato.' });
    }
});

// **Nova rota**: Inativar contato
// PUT /api/categories/contatos/:value/inativar
router.put('/contatos/:value/inativar', async (req, res) => {
    const { value } = req.params;
    try {
        await query('UPDATE contatos SET active = false WHERE value = $1', [value]);
        res.json({ message: 'Contato inativado com sucesso.' });
    } catch (err) {
        console.error('Erro ao inativar contato:', err);
        res.status(500).json({ error: 'Erro ao inativar contato.' });
    }
});

// Deletar contato
router.delete('/contatos/:value', async (req, res) => {
    const { value } = req.params;
    try {
        await query('DELETE FROM contatos WHERE value = $1', [value]);
        res.sendStatus(204);
    } catch (err) {
        console.error('Erro ao apagar contato:', err);
        res.status(500).json({ error: 'Erro ao apagar contato.' });
    }
});

//
// ROTAS DE OCORRÊNCIAS
//

// Criar ocorrência
router.post('/ocorrencias', async (req, res) => {
    const { value } = req.body;
    try {
        await query('INSERT INTO ocorrencias(value) VALUES($1)', [value]);
        res.sendStatus(201);
    } catch (err) {
        console.error('Erro ao criar ocorrência:', err);
        res.status(500).json({ error: 'Erro ao criar ocorrência.' });
    }
});

// Atualizar ocorrência
router.put('/ocorrencias/:oldValue', async (req, res) => {
    const { oldValue } = req.params;
    const { value } = req.body;
    try {
        await query('UPDATE ocorrencias SET value = $1 WHERE value = $2', [value, oldValue]);
        res.json({ value });
    } catch (err) {
        console.error('Erro ao atualizar ocorrência:', err);
        res.status(500).json({ error: 'Erro ao atualizar ocorrência.' });
    }
});

// Deletar ocorrência
router.delete('/ocorrencias/:value', async (req, res) => {
    const { value } = req.params;
    try {
        await query('DELETE FROM ocorrencias WHERE value = $1', [value]);
        res.sendStatus(204);
    } catch (err) {
        console.error('Erro ao apagar ocorrência:', err);
        res.status(500).json({ error: 'Erro ao apagar ocorrência.' });
    }
});

module.exports = router;
