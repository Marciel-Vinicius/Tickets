// backend/routes/atendimentos.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const { query } = require('../db');
const router = express.Router();

// Listar todos os atendimentos
router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * 
         FROM atendimentos 
        ORDER BY dia DESC, hora_inicio DESC`,
      []
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro GET /api/atendimentos:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

// Cadastrar novo atendimento
router.post('/', async (req, res) => {
  try {
    const {
      id = uuidv4(), atendente, sector, dia,
      hora_inicio, hora_fim, loja, contato, ocorrencia
    } = req.body;

    await query(
      `INSERT INTO atendimentos
         (id, atendente, sector, dia, hora_inicio, hora_fim, loja, contato, ocorrencia)
       VALUES
         ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, atendente, sector, dia, hora_inicio, hora_fim, loja, contato, ocorrencia]
    );

    res.status(201).json({ message: 'Atendimento registrado com sucesso', id });
  } catch (err) {
    console.error('Erro POST /api/atendimentos:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

// **NOVO**: Atualizar atendimento existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      atendente, sector, dia,
      hora_inicio, hora_fim,
      loja, contato, ocorrencia
    } = req.body;

    const result = await query(
      `UPDATE atendimentos
          SET atendente   = $1,
              sector      = $2,
              dia         = $3,
              hora_inicio = $4,
              hora_fim    = $5,
              loja        = $6,
              contato     = $7,
              ocorrencia  = $8
        WHERE id = $9
        RETURNING *`,
      [atendente, sector, dia, hora_inicio, hora_fim, loja, contato, ocorrencia, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }

    res.json({ message: 'Atendimento atualizado com sucesso', updated: result.rows[0] });
  } catch (err) {
    console.error('Erro PUT /api/atendimentos/:id:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

// Excluir atendimento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM atendimentos WHERE id = $1`, [id]);
    res.json({ message: 'Atendimento excluído com sucesso' });
  } catch (err) {
    console.error('Erro DELETE /api/atendimentos/:id:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

// Gerar PDF de relatório
router.get('/report', async (req, res) => {
  try {
    const { date } = req.query;
    const { rows } = await query(`SELECT * FROM atendimentos WHERE dia = $1`, [date]);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(16).text(`Relatório de Atendimentos - ${date}`, { underline: true });
    doc.moveDown();

    rows.forEach(r => {
      doc
        .fontSize(12)
        .text(`Atendente: ${r.atendente}`)
        .text(`Setor: ${r.sector}`)
        .text(`Data: ${r.dia}`)
        .text(`Início: ${r.hora_inicio}  Fim: ${r.hora_fim}`)
        .text(`Loja: ${r.loja}`)
        .text(`Contato: ${r.contato}`)
        .text(`Ocorrência: ${r.ocorrencia}`)
        .moveDown();
    });

    // assinaturas
    const footerY = doc.page.height - doc.page.margins.bottom - 50;
    const labelY = footerY - 15;
    const lineW = 210;
    doc.font('Helvetica').fontSize(12);
    doc.text('Ass. Plantonista', 50, labelY);
    doc.moveTo(50, footerY).lineTo(50 + lineW, footerY).stroke();
    doc.text('Ass. Supervisor', 350, labelY);
    doc.moveTo(350, footerY).lineTo(350 + lineW, footerY).stroke();

    doc.end();
  } catch (err) {
    console.error('Erro GET /api/atendimentos/report:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

module.exports = router;
