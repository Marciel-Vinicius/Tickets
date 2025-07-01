// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // seu Pool do pg

// GET /api/reports/summary
router.get('/summary', async (req, res) => {
    try {
        // 1) tempo médio em segundos
        const avgQ = await pool.query(`
      SELECT AVG(EXTRACT(EPOCH FROM hora_fim - hora_inicio)) AS avg_secs
      FROM atendimentos
    `);
        const avgSec = parseFloat(avgQ.rows[0].avg_secs) || 0;
        const avgDate = new Date(avgSec * 1000)
            .toISOString()
            .substr(11, 8); // HH:MM:SS

        // 2) total de atendimentos
        const totQ = await pool.query(`
      SELECT COUNT(*)::int AS total FROM atendimentos
    `);
        const total = totQ.rows[0].total;

        // 3) quem mais atendeu
        const topQ = await pool.query(`
      SELECT atendente, COUNT(*)::int AS cnt
      FROM atendimentos
      GROUP BY atendente
      ORDER BY cnt DESC
      LIMIT 1
    `);
        const topRow = topQ.rows[0] || { atendente: null, cnt: 0 };

        res.json({
            averageTime: avgDate,
            total,
            topAttendant: topRow.atendente,
            topCount: topRow.cnt
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'internal_server_error' });
    }
});

module.exports = router;
