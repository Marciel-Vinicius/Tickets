// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Resumo: tempo médio (minutos), total de atendimentos e top atendente
router.get('/summary', async (req, res) => {
    try {
        // tempo médio em segundos
        const avgQ = await pool.query(`
      SELECT AVG(EXTRACT(EPOCH FROM hora_fim - hora_inicio)) AS avg_secs
      FROM atendimentos
    `);
        const avgSec = parseFloat(avgQ.rows[0].avg_secs) || 0;
        const averageTime = Math.round(avgSec / 60);

        // total de atendimentos
        const totalQ = await pool.query(`
      SELECT COUNT(*)::int AS count FROM atendimentos
    `);
        const total = totalQ.rows[0].count;

        // top atendente
        const topQ = await pool.query(`
      SELECT atendente, COUNT(*)::int AS count
      FROM atendimentos
      GROUP BY atendente
      ORDER BY count DESC
      LIMIT 1
    `);
        const topAttendant = topQ.rows[0]?.atendente || null;
        const topCount = topQ.rows[0]?.count || 0;

        res.json({ averageTime, total, topAttendant, topCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao gerar summary' });
    }
});

// Atendimentos por usuário
router.get('/byUser', async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT atendente, COUNT(*)::int AS count
      FROM atendimentos
      GROUP BY atendente
      ORDER BY atendente
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro em byUser' });
    }
});

// Atendimentos por dia (últimos 7 dias)
router.get('/byDay', async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT to_char(dia, 'YYYY-MM-DD') AS dia,
             COUNT(*)::int AS count
      FROM atendimentos
      WHERE dia >= (CURRENT_DATE - INTERVAL '6 days')
      GROUP BY dia
      ORDER BY dia
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro em byDay' });
    }
});

// Atendimentos por loja
router.get('/byStore', async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT loja, COUNT(*)::int AS count
      FROM atendimentos
      GROUP BY loja
      ORDER BY loja
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro em byStore' });
    }
});

// Atendimentos por ocorrência
router.get('/byOccurrence', async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT ocorrencia, COUNT(*)::int AS count
      FROM atendimentos
      GROUP BY ocorrencia
      ORDER BY ocorrencia
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro em byOccurrence' });
    }
});

// Atendimentos por setor
router.get('/bySector', async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT setor, COUNT(*)::int AS count
      FROM atendimentos
      GROUP BY setor
      ORDER BY setor
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro em bySector' });
    }
});

// Atendimentos por mês (últimos 6 meses)
router.get('/byMonth', async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT to_char(dia, 'YYYY-MM') AS mes,
             COUNT(*)::int AS count
      FROM atendimentos
      WHERE dia >= (date_trunc('month', CURRENT_DATE) - INTERVAL '5 months')
      GROUP BY mes
      ORDER BY mes
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro em byMonth' });
    }
});

module.exports = router;
