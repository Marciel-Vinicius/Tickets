const express = require('express');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const { query } = require('../db');
const router = express.Router();

// Listar TODOS os atendimentos
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

// Criar novo atendimento
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
    res.status(201).json({ message: 'Atendimento criado com sucesso.' });
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
      `UPDATE atendimentos
        SET atendente=$1, dia=$2, hora_inicio=$3, hora_fim=$4,
            loja=$5, contato=$6, ocorrencia=$7
        WHERE id=$8`,
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
    await query(
      `DELETE FROM atendimentos WHERE id = $1`,
      [id]
    );
    res.json({ message: 'Atendimento removido com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao remover atendimento.' });
  }
});

// Exportar relatório em PDF (corrigido)
router.get('/report/:date', async (req, res) => {
  const date = req.params.date;
  try {
    const { rows: items } = await query(
      `SELECT
        hora_inicio,
        hora_fim,
        loja,
        contato,
        ocorrencia
      FROM atendimentos
      WHERE to_char(dia, 'YYYY-MM-DD') = $1
      ORDER BY hora_inicio ASC`,
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

    // Cabeçalho
    const startY = doc.y;
    doc.font('Helvetica-Bold').fontSize(10)
      .text('H.Início', 40, startY)
      .text('H.Fim', 100, startY)
      .text('Loja', 160, startY, { width: 90, continued: false })
      .text('Contato', 260, startY, { width: 90, continued: false })
      .text('Ocorrência', 360, startY, { width: 200, continued: false });
    doc.moveDown(0.5);

    // Dados das linhas

    const lineYs = [];
    const colXs = [40, 100, 160, 260, 360, 560];
    const colWidths = [60, 60, 100, 100, 200];

    items.forEach(item => {
      const linhaY = doc.y;

      // Calcular a altura da célula mais alta
      const heights = [
        doc.heightOfString(item.loja, { width: colWidths[2] }),
        doc.heightOfString(item.contato, { width: colWidths[3] }),
        doc.heightOfString(item.ocorrencia, { width: colWidths[4] })
      ];
      const maxHeight = Math.max(...heights, 12);

      lineYs.push(linhaY);

      const offsetY = linhaY + (maxHeight - 10) / 2;

      doc.font('Helvetica').fontSize(10)
        .text(item.hora_inicio, colXs[0], offsetY, { width: colWidths[0], align: 'center' })
        .text(item.hora_fim || '-', colXs[1], offsetY, { width: colWidths[1], align: 'center' })
        .text(item.loja, colXs[2], offsetY, { width: colWidths[2], align: 'center' })
        .text(item.contato, colXs[3], offsetY, { width: colWidths[3], align: 'center' })
        .text(item.ocorrencia, colXs[4], offsetY, { width: colWidths[4], align: 'center' });

      doc.y = linhaY + maxHeight + 4;
    });

    // Grade
    lineYs.forEach(y => {
      doc.moveTo(40, y).lineTo(560, y).stroke();
    });
    doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();

    colXs.forEach(x => {
      doc.moveTo(x, lineYs[0]).lineTo(x, doc.y).stroke();
    });
    doc.moveTo(560, lineYs[0]).lineTo(560, doc.y).stroke();

    const footerY = doc.page.height - doc.page.margins.bottom - 50;
    const labelY = footerY - 15;
    const lineW = 210;
    doc.font('Helvetica').fontSize(12)
      .moveTo(50, footerY).lineTo(50 + lineW, footerY).stroke()
      .text('Ass. Plantonista', 50, footerY + 5)
      .moveTo(50, footerY).lineTo(50 + lineW, footerY).stroke()
      .moveTo(350, footerY).lineTo(350 + lineW, footerY).stroke()
      .text('Ass. Supervisor', 350, footerY + 5)
      .moveTo(350, footerY).lineTo(350 + lineW, footerY).stroke();

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao gerar PDF.' });
  }
});

module.exports = router;
