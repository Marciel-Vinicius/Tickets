const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /api/reports/summary
router.get('/summary', async (req, res) => {
    const client = await pool.connect();
    try {
        const avgQ = await client.query(`
      SELECT AVG(EXTRACT(EPOCH FROM hora_fim - hora_inicio)) AS avg_secs
      FROM atendimentos
    `);
        const avgSec = parseFloat(avgQ.rows[0].avg_secs) || 0;
        const averageTime = new Date(avgSec * 1000)
            .toISOString().substr(11, 8);

        const totQ = await client.query(`SELECT COUNT(*)::int AS total FROM atendimentos`);
        const total = totQ.rows[0].total;

        const topQ = await client.query(`
      SELECT atendente, COUNT(*)::int AS count
      FROM atendimentos
      GROUP BY atendente
      ORDER BY count DESC
      LIMIT 1
    `);
        const top = topQ.rows[0] || { atendente: null, count: 0 };

        res.json({ averageTime, total, topAttendant: top.atendente, topCount: top.count });
    } catch (err) {
        console.error('Erro em GET /api/reports/summary:', err);
        res.status(500).json({ error: 'internal_server_error' });
    } finally {
        client.release();
    }
});

// GET /api/reports/byUser
router.get('/byUser', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
      SELECT atendente, COUNT(*)::int AS count
      FROM atendimentos
      GROUP BY atendente
      ORDER BY count DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro em GET /api/reports/byUser:', err);
        res.status(500).json({ error: 'internal_server_error' });
    } finally {
        client.release();
    }
});

// GET /api/reports/byDay
router.get('/byDay', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
      SELECT dia, COUNT(*)::int AS count
      FROM atendimentos
      GROUP BY dia
      ORDER BY dia
    `);
        res.json(
            result.rows.map(r => ({
                dia: r.dia.toISOString().split('T')[0],
                count: r.count
            }))
        );
    } catch (err) {
        console.error('Erro em GET /api/reports/byDay:', err);
        res.status(500).json({ error: 'internal_server_error' });
    } finally {
        client.release();
    }
});

module.exports = router;
