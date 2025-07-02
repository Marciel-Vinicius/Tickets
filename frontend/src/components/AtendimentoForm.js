// frontend/src/components/AtendimentoForm.js
import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';

export default function AtendimentoForm({
  onAdd,
  token,
  atendente,
  editingAtendimento,
  onEditComplete
}) {
  const today = new Date().toISOString().split('T')[0];
  const initialForm = {
    dia: today,
    horaInicio: '',
    horaFim: '',
    loja: '',
    contato: '',
    ocorrencia: '',
    observacao: ''
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (editingAtendimento) {
      setForm({
        dia: editingAtendimento.dia.split('T')[0],
        horaInicio: editingAtendimento.horaInicio,
        horaFim: editingAtendimento.horaFim,
        loja: editingAtendimento.loja,
        contato: editingAtendimento.contato,
        ocorrencia: editingAtendimento.ocorrencia,
        observacao: editingAtendimento.observacao || ''
      });
    } else {
      setForm(initialForm);
    }
  }, [editingAtendimento]);

  const isValid =
    form.dia &&
    form.horaInicio &&
    form.horaFim &&
    form.loja &&
    form.contato &&
    form.ocorrencia;

  const handleSubmit = e => {
    e.preventDefault();
    const method = editingAtendimento ? 'PUT' : 'POST';
    const url = editingAtendimento
      ? `${API_URL}/api/atendimentos/${editingAtendimento.id}`
      : `${API_URL}/api/atendimentos`;
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({
        atendente,
        dia: form.dia,
        horaInicio: form.horaInicio,
        horaFim: form.horaFim,
        loja: form.loja,
        contato: form.contato,
        ocorrencia: form.ocorrencia,
        observacao: form.observacao
      })
    })
      .then(() => {
        onAdd();
        if (editingAtendimento) onEditComplete();
        setForm(initialForm);
      })
      .catch(console.error);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {editingAtendimento ? 'Editar Atendimento' : 'Novo Atendimento'}
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Data"
          type="date"
          value={form.dia}
          onChange={e => setForm(f => ({ ...f, dia: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Início"
          type="time"
          value={form.horaInicio}
          onChange={e => setForm(f => ({ ...f, horaInicio: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Término"
          type="time"
          value={form.horaFim}
          onChange={e => setForm(f => ({ ...f, horaFim: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl>
          <InputLabel>Loja</InputLabel>
          <Select
            value={form.loja}
            label="Loja"
            onChange={e => setForm(f => ({ ...f, loja: e.target.value }))}
          >
            {/* carregar opções de lojas */}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>Contato</InputLabel>
          <Select
            value={form.contato}
            label="Contato"
            onChange={e => setForm(f => ({ ...f, contato: e.target.value }))}
          >
            {/* carregar opções de contatos */}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>Ocorrência</InputLabel>
          <Select
            value={form.ocorrencia}
            label="Ocorrência"
            onChange={e => setForm(f => ({ ...f, ocorrencia: e.target.value }))}
          >
            {/* carregar opções de ocorrências */}
          </Select>
        </FormControl>
        <TextField
          label="Observação"
          value={form.observacao}
          onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
          multiline
          rows={2}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          {editingAtendimento && (
            <Button variant="outlined" onClick={onEditComplete}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={!isValid}>
            {editingAtendimento ? 'Salvar' : 'Cadastrar'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
