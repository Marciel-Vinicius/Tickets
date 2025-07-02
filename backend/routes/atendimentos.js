const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db');
const router = express.Router();

// Listar atendimentos
router.get('/', async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM atendimentos ORDER BY dia DESC, hora_inicio DESC',
    []
  );
  res.json(rows);
});

// Criar atendimento
router.post('/', async (req, res) => {
  const { atendente, dia, horaInicio, horaFim, loja, contato, ocorrencia } = req.body;
  const setor = req.user.sector;
  const id = uuidv4();

  await query(
    `INSERT INTO atendimentos(
      id, atendente, setor, dia, hora_inicio, hora_fim, loja, contato, ocorrencia
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, atendente, setor, dia, horaInicio, horaFim, loja, contato, ocorrencia]
  );
  res.json({ success: true });
});

// Editar atendimento
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { atendente, dia, horaInicio, horaFim, loja, contato, ocorrencia } = req.body;
  await query(
    `UPDATE atendimentos
     SET atendente = $1, dia = $2, hora_inicio = $3, hora_fim = $4, loja = $5, contato = $6, ocorrencia = $7
     WHERE id = $8`,
    [atendente, dia, horaInicio, horaFim, loja, contato, ocorrencia, id]
  );
  res.json({ success: true });
});

// Excluir atendimento
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM atendimentos WHERE id = $1', [id]);
  res.json({ success: true });
});

module.exports = router;
