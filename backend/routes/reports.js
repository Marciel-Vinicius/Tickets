// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1) Resumo geral
router.get('/summary', async (req, res) => {
    try {
        const avgQ = await pool.query(`
      SELECT AVG(EXTRACT(EPOCH FROM hora_fim - hora_inicio)) AS avg_secs
      FROM atendimentos
    `);
        const avgSec = parseFloat(avgQ.rows[0].avg_secs) || 0;
        const averageTime = new Date(avgSec * 1000)
            .toISOString()
            .substr(11, 8); // HH:MM:SS

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
        const top = topQ.rows[0] || { atendente: null, count: 0 };

        res.json({
            averageTime,
            total,
            topAttendant: top.atendente,
            topCount: top.count
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'internal_server_error' });
    }
});

// 2) Atendimentos por usuário (gráfico de barras)
router.get('/byUser', async (req, res) => {
    try {
        const q = await pool.query(`
      SELECT atendente, COUNT(*)::int AS count
      FROM atendimentos
      GROUP BY atendente
      ORDER BY count DESC
    `);
        res.json(q.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'internal_server_error' });
    }
});

// 3) Atendimentos por dia (gráfico de linha)
router.get('/byDay', async (req, res) => {
    try {
        const q = await pool.query(`
      SELECT dia, COUNT(*)::int AS count
      FROM atendimentos
      GROUP BY dia
      ORDER BY dia
    `);
        res.json(
            q.rows.map(r => ({
                dia: r.dia.toISOString().split('T')[0], // "YYYY-MM-DD"
                count: r.count
            }))
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'internal_server_error' });
    }
});

module.exports = router;
