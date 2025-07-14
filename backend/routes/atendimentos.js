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
    items.forEach(item => {
      const linhaY = doc.y;
      doc.font('Helvetica').fontSize(10)
        .text(item.hora_inicio, 40, linhaY)
        .text(item.hora_fim || '-', 100, linhaY)
        .text(item.loja, 160, linhaY, { width: 90, ellipsis: true })
        .text(item.contato, 260, linhaY, { width: 90, ellipsis: true })
        .text(item.ocorrencia, 360, linhaY, { width: 200, ellipsis: true });

      // Corrige o Y para a próxima linha, considerando altura de texto em cada coluna
      const nextY = Math.max(
        doc.y,
        linhaY +
        Math.max(
          doc.heightOfString(item.loja, { width: 90 }),
          doc.heightOfString(item.contato, { width: 90 }),
          doc.heightOfString(item.ocorrencia, { width: 200 })
        )
      );
      doc.y = nextY;
      doc.moveDown(0.5);
    });


    // Linhas de grade
    const tableTop = startY + 15;
    const rowHeight = 20;
    const tableBottom = doc.y;

    // Desenhar linhas horizontais
    let currentY = tableTop;
    while (currentY < tableBottom) {
      doc.moveTo(40, currentY).lineTo(550, currentY).stroke();
      currentY += rowHeight;
    }

    // Desenhar linhas verticais
    doc.moveTo(40, tableTop).lineTo(40, tableBottom).stroke();     // H.Início
    doc.moveTo(100, tableTop).lineTo(100, tableBottom).stroke();   // H.Fim
    doc.moveTo(160, tableTop).lineTo(160, tableBottom).stroke();   // Loja
    doc.moveTo(260, tableTop).lineTo(260, tableBottom).stroke();   // Contato
    doc.moveTo(360, tableTop).lineTo(360, tableBottom).stroke();   // Ocorrência
    doc.moveTo(560, tableTop).lineTo(560, tableBottom).stroke();   // Fim tabela

    // Rodapé com assinatura

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
