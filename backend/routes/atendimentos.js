// backend/routes/atendimentos.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const { query } = require('../db');
const router = express.Router();

// Lista TODOS os atendimentos
router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      `
      SELECT
        id,
        atendente,
        setor,
        to_char(dia, 'YYYY-MM-DD') AS dia,
        hora_inicio,
        hora_fim,
        loja,
        contato,
        ocorrencia
      FROM atendimentos
      ORDER BY dia DESC, hora_inicio DESC
      `,
      []
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar atendimentos.' });
  }
});

// Cria novo atendimento
router.post('/', async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao cadastrar atendimento.' });
  }
});

// Atualiza um atendimento existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { atendente, dia, horaInicio, horaFim, loja, contato, ocorrencia } = req.body;
    const setor = req.user.sector;
    const result = await query(
      `UPDATE atendimentos SET
         atendente=$1, setor=$2, dia=$3, hora_inicio=$4, hora_fim=$5,
         loja=$6, contato=$7, ocorrencia=$8
       WHERE id=$9
       RETURNING
         id,
         atendente,
         setor,
         to_char(dia,'YYYY-MM-DD') AS dia,
         hora_inicio,
         hora_fim,
         loja,
         contato,
         ocorrencia`,
      [atendente, setor, dia, horaInicio, horaFim, loja, contato, ocorrencia, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Atendimento não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar atendimento.' });
  }
});

// Deleta um atendimento
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM atendimentos WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao deletar atendimento.' });
  }
});

// Gera PDF de relatório
router.get('/report', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Parâmetro "date" é obrigatório.' });

    const { rows: items } = await query(
      'SELECT * FROM atendimentos WHERE dia=$1 ORDER BY hora_inicio',
      [date]
    );

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="plantao-${date}.pdf"`);
    doc.pipe(res);

    doc.font('Helvetica-Bold').fontSize(14)
      .text(`PLANTONISTA: ${req.user.username}`);
    doc.moveDown(0.5);
    const [y, m, d] = date.split('-');
    doc.font('Helvetica').fontSize(12)
      .text(`Data: ${d}/${m}/${y}`);
    doc.moveDown();

    const top = doc.y;
    doc.font('Helvetica-Bold').fontSize(10)
      .text('H.Início', 50, top)
      .text('Loja', 130, top)
      .text('Contato', 260, top)
      .text('Ocorrência', 380, top);
    doc.moveDown();

    items.forEach(item => {
      const startY = doc.y;
      doc.font('Helvetica').fontSize(10)
        .text(item.hora_inicio, 50, startY)
        .text(item.loja, 130, startY)
        .text(item.contato, 260, startY)
        .text(item.ocorrencia, 380, startY);
      doc.moveDown();
    });

    const footerY = doc.page.height - doc.page.margins.bottom - 50;
    const labelY = footerY - 15;
    const lineW = 210;
    doc.font('Helvetica').fontSize(12)
      .text('Ass. Plantonista', 50, labelY)
      .moveTo(50, footerY).lineTo(50 + lineW, footerY).stroke()
      .text('Ass. Supervisor', 350, labelY)
      .moveTo(350, footerY).lineTo(350 + lineW, footerY).stroke();

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao gerar relatório.' });
  }
});

module.exports = router;
