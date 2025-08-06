// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper para montar filtro de data
function buildDateFilter(query) {
    const { startDate, endDate } = query;
    if (startDate && endDate) {
        return {
            clause: `WHERE dia BETWEEN $1 AND $2`,
            params: [startDate, endDate]
        };
    }
    return { clause: '', params: [] };
}

// Resumo: tempo médio (minutos), total de atendimentos e top atendente
router.get('/summary', async (req, res) => {
    try {
        const { clause, params } = buildDateFilter(req.query);

        const avgQ = await pool.query(
            `
        SELECT AVG(EXTRACT(EPOCH FROM hora_fim - hora_inicio)) AS avg_secs
        FROM atendimentos
        ${clause}
      `,
            params
        );
        const avgSec = parseFloat(avgQ.rows[0].avg_secs) || 0;
        const averageTime = Math.round(avgSec / 60);

        const totalQ = await pool.query(
            `
        SELECT COUNT(*)::int AS total
        FROM atendimentos
        ${clause}
      `,
            params
        );
        const total = totalQ.rows[0].total;

        const topUserQ = await pool.query(
            `
        SELECT atendente, COUNT(*)::int AS count
        FROM atendimentos
        ${clause}
        GROUP BY atendente
        ORDER BY count DESC
        LIMIT 1
      `,
            params
        );
        const topUser = topUserQ.rows[0] || { atendente: null, count: 0 };

        res.json({ averageTime, total, topUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro em summary' });
    }
});

// Atendimentos por usuário
router.get('/byUser', async (req, res) => {
    try {
        const { clause, params } = buildDateFilter(req.query);
        const { rows } = await pool.query(
            `
        SELECT atendente, COUNT(*)::int AS count
        FROM atendimentos
        ${clause}
        GROUP BY atendente
        ORDER BY atendente
      `,
            params
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro em byUser' });
    }
});

// Atendimentos por dia
router.get('/byDay', async (req, res) => {
    try {
        const { clause, params } = buildDateFilter(req.query);

        let base = `
      SELECT to_char(dia, 'YYYY-MM-DD') AS dia, COUNT(*)::int AS count
      FROM atendimentos
    `;

        // Se não houver filtro, manter últimos 7 dias
        if (!clause) {
            base += ` WHERE dia >= (CURRENT_DATE - INTERVAL '6 days')`;
        } else {
            base += ` ${clause}`;
        }

        base += `
      GROUP BY dia
      ORDER BY dia
    `;

        const { rows } = await pool.query(base, clause ? params : []);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro em byDay' });
    }
});

// Atendimentos por loja
router.get('/byStore', async (req, res) => {
    try {
        const { clause, params } = buildDateFilter(req.query);
        const { rows } = await pool.query(
            `
        SELECT loja, COUNT(*)::int AS count
        FROM atendimentos
        ${clause}
        GROUP BY loja
        ORDER BY loja
      `,
            params
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro em byStore' });
    }
});

// Atendimentos por ocorrência
router.get('/byOccurrence', async (req, res) => {
    try {
        const { clause, params } = buildDateFilter(req.query);
        const { rows } = await pool.query(
            `
        SELECT ocorrencia, COUNT(*)::int AS count
        FROM atendimentos
        ${clause}
        GROUP BY ocorrencia
        ORDER BY ocorrencia
      `,
            params
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro em byOccurrence' });
    }
});

// Atendimentos por setor
router.get('/bySector', async (req, res) => {
    try {
        const { clause, params } = buildDateFilter(req.query);
        const { rows } = await pool.query(
            `
        SELECT setor, COUNT(*)::int AS count
        FROM atendimentos
        ${clause}
        GROUP BY setor
        ORDER BY setor
      `,
            params
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro em bySector' });
    }
});

// Atendimentos por mês
router.get('/byMonth', async (req, res) => {
    try {
        const { clause, params } = buildDateFilter(req.query);

        let dateFilter = clause || `WHERE dia >= (date_trunc('month', CURRENT_DATE) - INTERVAL '5 months')`;
        const { rows } = await pool.query(
            `
        SELECT to_char(dia, 'YYYY-MM') AS mes, COUNT(*)::int AS count
        FROM atendimentos
        ${dateFilter}
        GROUP BY mes
        ORDER BY mes
      `,
            clause ? params : []
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro em byMonth' });
    }
});

module.exports = router;
