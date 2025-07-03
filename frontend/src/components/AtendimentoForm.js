// frontend/src/components/AtendimentoForm.js
import React, { useState, useEffect } from 'react';
import { Paper, Box, TextField, MenuItem, Button, Typography } from '@mui/material';
import apiFetch from '../api';

export default function AtendimentoForm({
  token,
  atendente,
  editingAtendimento,
  onAdd,
  onUpdate,
  clearEditing
}) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    atendente: atendente || '',
    dia: today,
    horaInicio: '',
    horaFim: '',
    loja: '',
    contato: '',
    ocorrencia: ''
  });
  const [opts, setOpts] = useState({ lojas: [], contatos: [], ocorrencias: [] });

  useEffect(() => {
    apiFetch('/categories').then(setOpts).catch(console.error);
  }, []);

  useEffect(() => {
    if (editingAtendimento) {
      setForm({
        atendente: editingAtendimento.atendente,
        dia: editingAtendimento.data.split('/').reverse().join('-'),
        horaInicio: editingAtendimento.horaInicio,
        horaFim: editingAtendimento.horaFim,
        loja: editingAtendimento.loja,
        contato: editingAtendimento.contato,
        ocorrencia: editingAtendimento.ocorrencia
      });
    } else {
      setForm(f => ({ ...f, dia: today, horaInicio: '', horaFim: '', loja: '', contato: '', ocorrencia: '' }));
    }
  }, [editingAtendimento]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = {
      atendente: form.atendente,
      dia: form.dia,
      horaInicio: form.horaInicio,
      horaFim: form.horaFim,
      loja: form.loja,
      contato: form.contato,
      ocorrencia: form.ocorrencia
    };
    const isEdit = Boolean(editingAtendimento);
    const url = isEdit ? `/atendimentos/${editingAtendimento.id}` : '/atendimentos';
    const method = isEdit ? 'PUT' : 'POST';

    apiFetch(url, { method, body: payload })
      .then(() => {
        clearEditing();
        isEdit ? onUpdate() : onAdd();
        setForm(f => ({ ...f, dia: today, horaInicio: '', horaFim: '', loja: '', contato: '', ocorrencia: '' }));
      })
      .catch(err => alert(err.message));
  };

  return (
    <Paper elevation={3} sx={{ width: '100%' }}>
      <Box component="form" onSubmit={handleSubmit}
        sx={{ p: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="h6">
            {editingAtendimento ? 'Editar Atendimento' : 'Cadastrar Atendimento'}
          </Typography>
        </Box>
        <TextField
          label="Atendente"
          name="atendente"
          value={form.atendente}
          disabled
          sx={{ flex: '1 1 200px' }}
        />
        <TextField
          label="Data"
          name="dia"
          type="date"
          required
          InputLabelProps={{ shrink: true }}
          value={form.dia}
          onChange={handleChange}
          sx={{ flex: '1 1 150px' }}
        />
        <TextField
          label="Hora Início"
          name="horaInicio"
          type="time"
          required
          InputLabelProps={{ shrink: true }}
          value={form.horaInicio}
          onChange={handleChange}
          sx={{ flex: '1 1 120px' }}
        />
        <TextField
          label="Hora Fim"
          name="horaFim"
          type="time"
          required
          InputLabelProps={{ shrink: true }}
          value={form.horaFim}
          onChange={handleChange}
          sx={{ flex: '1 1 120px' }}
        />
        <TextField
          select label="Loja" name="loja"
          value={form.loja} onChange={handleChange}
          sx={{ flex: '1 1 150px' }}
        >
          {opts.lojas.map(loja => <MenuItem key={loja} value={loja}>{loja}</MenuItem>)}
        </TextField>
        <TextField
          select label="Contato" name="contato"
          value={form.contato} onChange={handleChange}
          sx={{ flex: '1 1 150px' }}
        >
          {opts.contatos.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField
          select label="Ocorrência" name="ocorrencia"
          value={form.ocorrencia} onChange={handleChange}
          sx={{ flex: '1 1 150px' }}
        >
          {opts.ocorrencias.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <Button type="submit" variant="contained" size="large"
          sx={{ flex: '0 0 auto' }}>
          {editingAtendimento ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </Box>
    </Paper>
  );
}
