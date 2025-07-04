const express = require('express');
const router = express.Router();
const pool = require('../db');

// Tempo médio, total e top atendente (já existia)
router.get('/summary', async (req, res) => {
    try {
        const avgQ = await pool.query(`
            SELECT AVG(EXTRACT(EPOCH FROM hora_fim - hora_inicio)) AS avg_secs
            FROM atendimentos
        `);
        const avgSec = parseFloat(avgQ.rows[0].avg_secs) || 0;
        const averageTime = new Date(avgSec * 1000)
            .toISOString()
            .substr(11, 8);

        const totQ = await pool.query(`
            SELECT COUNT(*)::int AS total FROM atendimentos
        `);
        const total = totQ.rows[0].total;

        const topQ = await pool.query(`
            SELECT atendente, COUNT(*)::int AS count
            FROM atendimentos
            GROUP BY atendente
            ORDER BY count DESC
            LIMIT 1
        `);
        const topAttendant = topQ.rows[0]?.atendente || '';
        const topCount = topQ.rows[0]?.count || 0;

        res.json({ averageTime, total, topAttendant, topCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao gerar resumo.' });
    }
});

// Atendimentos por usuário
router.get('/byUser', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT atendente, COUNT(*)::int AS count
            FROM atendimentos
            GROUP BY atendente
            ORDER BY count DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao gerar relatório por usuário.' });
    }
});

// Atendimentos por dia
router.get('/byDay', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT to_char(dia, 'YYYY-MM-DD') AS dia, COUNT(*)::int AS count
            FROM atendimentos
            GROUP BY dia
            ORDER BY dia ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao gerar relatório por dia.' });
    }
});

// NOVO: Atendimentos por loja (top 5)
router.get('/byStore', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT loja, COUNT(*)::int AS count
            FROM atendimentos
            GROUP BY loja
            ORDER BY count DESC
            LIMIT 5
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao gerar relatório por loja.' });
    }
});

// NOVO: Atendimentos por ocorrência (top 5 tipos)
router.get('/byOccurrence', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT ocorrencia, COUNT(*)::int AS count
            FROM atendimentos
            GROUP BY ocorrencia
            ORDER BY count DESC
            LIMIT 5
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao gerar relatório por ocorrência.' });
    }
});

// NOVO: Atendimentos por setor (top setores)
router.get('/bySector', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT setor, COUNT(*)::int AS count
            FROM atendimentos
            GROUP BY setor
            ORDER BY count DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao gerar relatório por setor.' });
    }
});

// NOVO: Evolução mês a mês (últimos 6 meses)
router.get('/byMonth', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT to_char(dia, 'YYYY-MM') AS mes, COUNT(*)::int AS count
            FROM atendimentos
            WHERE dia >= (CURRENT_DATE - INTERVAL '6 months')
            GROUP BY mes
            ORDER BY mes ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao gerar evolução mensal.' });
    }
});

module.exports = router;
