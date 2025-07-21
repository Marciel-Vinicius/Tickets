// backend/routes/atendimento.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const { query } = require('../db');
const router = express.Router();

// Listar TODOS os atendimentos, incluindo quantidade de sábados trabalhados por atendente
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
        ocorrencia,
        COUNT(*) FILTER (WHERE EXTRACT(DOW FROM dia) = 6)
          OVER (PARTITION BY atendente) AS sabados_trabalhados
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

// Criar novo atendimento
router.post('/', async (req, res) => {
  try {
    const { atendente, dia, horaInicio, horaFim, loja, contato, ocorrencia } = req.body;
    const setor = req.user.sector;
    const id = uuidv4();

    await query(
      `
      INSERT INTO atendimentos(
        id, atendente, setor, dia, hora_inicio, hora_fim,
        loja, contato, ocorrencia
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [id, atendente, setor, dia, horaInicio, horaFim, loja, contato, ocorrencia]
    );

    res.status(201).json({
      id,
      atendente,
      setor,
      dia,
      horaInicio,
      horaFim,
      loja,
      contato,
      ocorrencia
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar atendimento.' });
  }
});

// Editar atendimento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { atendente, dia, horaInicio, horaFim, loja, contato, ocorrencia } = req.body;
    await query(
      `
      UPDATE atendimentos
      SET
        atendente = $1,
        dia        = $2,
        hora_inicio = $3,
        hora_fim   = $4,
        loja       = $5,
        contato    = $6,
        ocorrencia = $7
      WHERE id = $8
      `,
      [atendente, dia, horaInicio, horaFim, loja, contato, ocorrencia, id]
    );
    res.json({ message: 'Atendimento atualizado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar atendimento.' });
  }
});

// Deletar atendimento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM atendimentos WHERE id = $1`, [id]);
    res.json({ message: 'Atendimento removido com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao remover atendimento.' });
  }
});

// Exportar relatório em PDF
router.get('/report/:date', async (req, res) => {
  const date = req.params.date;
  try {
    const { rows: items } = await query(
      `
      SELECT
        hora_inicio,
        hora_fim,
        loja,
        contato,
        ocorrencia
      FROM atendimentos
      WHERE to_char(dia, 'YYYY-MM-DD') = $1
      ORDER BY hora_inicio ASC
      `,
      [date]
    );

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="plantao-' + date + '.pdf"'
    );
    doc.pipe(res);

    // Cabeçalho
    doc.font('Helvetica-Bold').fontSize(14).text('PLANTONISTA: ' + req.user.username);
    doc.moveDown(0.5);
    const [y, m, d] = date.split('-');
    doc.font('Helvetica').fontSize(12).text('Data: ' + d + '/' + m + '/' + y);
    doc.moveDown();

    // Títulos das colunas
    const startY = doc.y;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('H.Início', 40, startY);
    doc.text('H.Fim', 100, startY);
    doc.text('Loja', 160, startY, { width: 90 });
    doc.text('Contato', 260, startY, { width: 90 });
    doc.text('Ocorrência', 360, startY, { width: 200 });
    doc.moveDown(0.5);

    // Dados das linhas
    const colXs = [40, 100, 160, 260, 360];
    const colWidths = [60, 60, 100, 100, 200];
    let currentY = doc.y;
    const rowYs = [];

    items.forEach(item => {
      const heights = [
        doc.heightOfString(item.hora_inicio, { width: colWidths[0] }),
        doc.heightOfString(item.hora_fim || '-', { width: colWidths[1] }),
        doc.heightOfString(item.loja, { width: colWidths[2] }),
        doc.heightOfString(item.contato, { width: colWidths[3] }),
        doc.heightOfString(item.ocorrencia, { width: colWidths[4] })
      ];
      const maxHeight = Math.max(...heights) + 10;
      rowYs.push({ y: currentY, h: maxHeight });

      const yCenter = currentY + maxHeight / 2;
      doc.font('Helvetica').fontSize(10);
      doc.text(item.hora_inicio, colXs[0], yCenter - heights[0] / 2, {
        width: colWidths[0],
        align: 'center'
      });
      doc.text(item.hora_fim || '-', colXs[1], yCenter - heights[1] / 2, {
        width: colWidths[1],
        align: 'center'
      });
      doc.text(item.loja, colXs[2], yCenter - heights[2] / 2, {
        width: colWidths[2],
        align: 'center'
      });
      doc.text(item.contato, colXs[3], yCenter - heights[3] / 2, {
        width: colWidths[3],
        align: 'center'
      });
      doc.text(item.ocorrencia, colXs[4], yCenter - heights[4] / 2, {
        width: colWidths[4],
        align: 'center'
      });

      currentY += maxHeight;
    });

    // Linhas da tabela
    rowYs.forEach(row => {
      doc.moveTo(40, row.y).lineTo(560, row.y).stroke();
    });
    doc.moveTo(40, currentY).lineTo(560, currentY).stroke();
    [40, 100, 160, 260, 360, 560].forEach(x => {
      doc.moveTo(x, rowYs[0].y).lineTo(x, currentY).stroke();
    });

    // Rodapé
    const footerY = doc.page.height - doc.page.margins.bottom - 50;
    const lineW = 210;
    doc.font('Helvetica').fontSize(12);
    doc.moveTo(50, footerY).lineTo(50 + lineW, footerY).stroke();
    doc.text('Ass. Plantonista', 50, footerY + 5);
    doc.moveTo(350, footerY).lineTo(350 + lineW, footerY).stroke();
    doc.text('Ass. Supervisor', 350, footerY + 5);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao gerar PDF.' });
  }
});

module.exports = router;
