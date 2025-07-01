const express = require('express');
const PDFDocument = require('pdfkit');
const pool = require('../db');

const router = express.Router();

// GET /api/atendimentos
router.get('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id, atendente, sector, dia, hora_inicio, hora_fim, loja, contato, ocorrencia
      FROM atendimentos
      ORDER BY dia
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro em GET /api/atendimentos:', err);
    res.status(500).json({ error: 'internal_server_error' });
  } finally {
    client.release();
  }
});

// POST /api/atendimentos
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      atendente, sector, dia,
      hora_inicio, hora_fim,
      loja, contato, ocorrencia
    } = req.body;
    await client.query(
      `INSERT INTO atendimentos
       (atendente, sector, dia, hora_inicio, hora_fim, loja, contato, ocorrencia)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [atendente, sector, dia, hora_inicio, hora_fim, loja, contato, ocorrencia]
    );
    res.status(201).json({ message: 'Atendimento registrado com sucesso' });
  } catch (err) {
    console.error('Erro em POST /api/atendimentos:', err);
    res.status(500).json({ error: 'internal_server_error' });
  } finally {
    client.release();
  }
});

// DELETE /api/atendimentos/:id
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('DELETE FROM atendimentos WHERE id = $1', [id]);
    res.json({ message: 'Atendimento excluído com sucesso' });
  } catch (err) {
    console.error('Erro em DELETE /api/atendimentos/:id:', err);
    res.status(500).json({ error: 'internal_server_error' });
  } finally {
    client.release();
  }
});

// GET /api/atendimentos/report?date=YYYY-MM-DD
router.get('/report', async (req, res) => {
  const client = await pool.connect();
  try {
    const { date } = req.query;
    const result = await client.query(
      'SELECT * FROM atendimentos WHERE dia = $1',
      [date]
    );
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.text('Relatório de Atendimentos - ' + date);
    result.rows.forEach(row => doc.text(JSON.stringify(row)));
    doc.end();
  } catch (err) {
    console.error('Erro em GET /api/atendimentos/report:', err);
    res.status(500).json({ error: 'internal_server_error' });
  } finally {
    client.release();
  }
});

module.exports = router;
