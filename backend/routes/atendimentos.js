// backend/routes/atendimentos.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const router = express.Router();
const dbFile = path.join(__dirname, '..', 'db.json');

function readDB() {
  return JSON.parse(fs.readFileSync(dbFile));
}
function writeDB(db) {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

// Helper para capitalizar nome
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// -- Listar --
router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.atendimentos);
});

// -- Criar --
router.post('/', (req, res) => {
  const db = readDB();
  const {
    atendente, dia, horaInicio, horaFim,
    loja, contato, ocorrencia
  } = req.body;
  const setor = req.user.sector;
  const atendimento = {
    id: uuidv4(),
    atendente,
    setor,
    dia,
    horaInicio,
    horaFim,
    loja,
    contato,
    ocorrencia
  };
  db.atendimentos.push(atendimento);
  writeDB(db);
  res.status(201).json(atendimento);
});

// -- Atualizar --
router.put('/:id', (req, res) => {
  const db = readDB();
  const idx = db.atendimentos.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.sendStatus(404);
  const {
    atendente, dia, horaInicio, horaFim,
    loja, contato, ocorrencia
  } = req.body;
  db.atendimentos[idx] = {
    id: req.params.id,
    atendente,
    setor: req.user.sector,
    dia,
    horaInicio,
    horaFim,
    loja,
    contato,
    ocorrencia
  };
  writeDB(db);
  res.json(db.atendimentos[idx]);
});

// -- Deletar --
router.delete('/:id', (req, res) => {
  const db = readDB();
  db.atendimentos = db.atendimentos.filter(a => a.id !== req.params.id);
  writeDB(db);
  res.sendStatus(204);
});

// -- Gerar relatório em PDF para qualquer data --
router.get('/report', (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ message: 'Parâmetro "date" é obrigatório' });
  }

  const db = readDB();
  const items = db.atendimentos.filter(a => a.dia === date);

  // Inicia PDF
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="plantao-${date}.pdf"`
  );
  doc.pipe(res);

  // Cabeçalho
  doc.font('Helvetica-Bold').fontSize(14)
    .text(`PLANTONISTA: ${capitalize(req.user.username)}`);
  doc.moveDown(0.5);

  // Formata data para DD/MM/YYYY
  const [year, month, day] = date.split('-');
  const formattedDate = `${day}/${month}/${year}`;
  doc.font('Helvetica').fontSize(12)
    .text(`Data do Relatório: ${formattedDate}`);
  doc.moveDown();

  // Título da tabela
  const tableTop = doc.y;
  doc.font('Helvetica-Bold').fontSize(10)
    .text('HORA INÍCIO', 50, tableTop)
    .text('LOJA', 130, tableTop)
    .text('CONTATO', 260, tableTop)
    .text('OCORRÊNCIA', 380, tableTop)
    .text('HORA FIM', 500, tableTop);
  doc.moveDown(0.5);

  // Linha sob o cabeçalho
  const lineY = doc.y;
  doc.moveTo(50, lineY).lineTo(550, lineY).stroke();
  doc.moveDown(0.5);

  // Linhas de dados
  doc.font('Helvetica').fontSize(10);
  items.forEach(item => {
    const rowY = doc.y;
    doc.text(item.horaInicio, 50, rowY)
      .text(item.loja, 130, rowY)
      .text(item.contato, 260, rowY)
      .text(item.ocorrencia, 380, rowY)
      .text(item.horaFim, 500, rowY);
    doc.moveDown(0.5);
  });

  // Assinaturas no rodapé, linhas iguais
  const footerY = doc.page.height - doc.page.margins.bottom - 50;
  const lineWidth = 210;
  const labelY = footerY - 15;

  doc.font('Helvetica').fontSize(12);
  // Plantonista
  doc.text('Ass. Plantonista', 50, labelY);
  doc.moveTo(50, footerY).lineTo(50 + lineWidth, footerY).stroke();
  // Supervisor
  doc.text('Ass. Supervisor', 350, labelY);
  doc.moveTo(350, footerY).lineTo(350 + lineWidth, footerY).stroke();

  doc.end();
});

module.exports = router;
