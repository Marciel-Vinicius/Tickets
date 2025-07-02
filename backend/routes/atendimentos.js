// backend/routes/atendimentos.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const { query } = require('../db');
const router = express.Router();

// Listar
router.get('/', async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM atendimentos ORDER BY dia DESC, hora_inicio DESC',
    []
  );
  res.json(rows);
});

// Criar
router.post('/', async (req, res) => {
  const { atendente, dia, horaInicio, horaFim, loja, contato, ocorrencia } = req.body;
  const setor = req.user.sector;
  const id = uuidv4();

  await query(
    `INSERT INTO atendimentos(
       id, atendente, setor, dia, hora_inicio, hora_fim,
       loja, contato, ocorrencia
     ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, atendente, setor, dia, horaInicio, horaFim, loja, contato, ocorrencia]
  );

  res.status(201).json({ id, atendente, setor, dia, horaInicio, horaFim, loja, contato, ocorrencia });
});

// Atualizar
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { atendente, dia, horaInicio, horaFim, loja, contato, ocorrencia } = req.body;
  const setor = req.user.sector;

  const result = await query('UPDATE atendimentos SET \
    atendente=$1, setor=$2, dia=$3, hora_inicio=$4, hora_fim=$5, \
    loja=$6, contato=$7, ocorrencia=$8 \
    WHERE id=$9 RETURNING *',
    [atendente, setor, dia, horaInicio, horaFim, loja, contato, ocorrencia, id]
  );

  if (result.rowCount === 0) return res.sendStatus(404);
  res.json(result.rows[0]);
});

// Deletar
router.delete('/:id', async (req, res) => {
  await query('DELETE FROM atendimentos WHERE id=$1', [req.params.id]);
  res.sendStatus(204);
});

// Relatório PDF
router.get('/report', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Parâmetro "date" é obrigatório' });

  const { rows: items } = await query(
    'SELECT * FROM atendimentos WHERE dia=$1 ORDER BY hora_inicio',
    [date]
  );

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="plantao-${date}.pdf"`);
  doc.pipe(res);

  // Cabeçalho
  doc.font('Helvetica-Bold').fontSize(14)
    .text(`PLANTONISTA: ${req.user.username}`);
  doc.moveDown(0.5);
  const [y, m, d] = date.split('-');
  doc.font('Helvetica').fontSize(12)
    .text(`Data: ${d}/${m}/${y}`);
  doc.moveDown();

  // Título
  const top = doc.y;
  doc.font('Helvetica-Bold').fontSize(10)
    .text('H.Início', 50, top)
    .text('Loja', 130, top)
    .text('Contato', 260, top)
    .text('Ocorrência', 380, top)
    .text('H.Fim', 500, top);
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Linhas
  doc.font('Helvetica').fontSize(10);
  items.forEach(i => {
    const rowY = doc.y;
    doc.text(i.hora_inicio, 50, rowY)
      .text(i.loja, 130, rowY)
      .text(i.contato, 260, rowY)
      .text(i.ocorrencia, 380, rowY)
      .text(i.hora_fim, 500, rowY);
    doc.moveDown(0.5);
  });

  // Assinaturas
  const footerY = doc.page.height - doc.page.margins.bottom - 50;
  const labelY = footerY - 15;
  const lineW = 210;
  doc.font('Helvetica').fontSize(12);
  doc.text('Ass. Plantonista', 50, labelY);
  doc.moveTo(50, footerY).lineTo(50 + lineW, footerY).stroke();
  doc.text('Ass. Supervisor', 350, labelY);
  doc.moveTo(350, footerY).lineTo(350 + lineW, footerY).stroke();

  doc.end();
});

module.exports = router;
