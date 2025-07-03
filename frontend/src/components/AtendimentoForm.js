// frontend/src/components/AtendimentoForm.js
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  TextField,
  MenuItem,
  Button,
  Typography
} from '@mui/material';
import API_URL from '../config';

export default function AtendimentoForm({
  token,
  atendente: userAtendente,
  onAdd,
  onUpdate,
  editingAtendimento,
  clearEditing
}) {
  const [form, setForm] = useState({
    atendente: userAtendente || '',
    dia: '',
    horaInicio: '',
    horaFim: '',
    loja: '',
    contato: '',
    ocorrencia: ''
  });
  const [opts, setOpts] = useState({ lojas: [], contatos: [], ocorrencias: [] });

  // carrega categorias
  useEffect(() => {
    fetch(`${API_URL}/api/categories`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(data => setOpts(data))
      .catch(console.error);
  }, [token]);

  // sempre que mudar editingAtendimento ou login, ajusta form
  useEffect(() => {
    if (editingAtendimento) {
      setForm({
        atendente: editingAtendimento.atendente,
        dia: editingAtendimento.dia,
        horaInicio: editingAtendimento.horaInicio,
        horaFim: editingAtendimento.horaFim,
        loja: editingAtendimento.loja,
        contato: editingAtendimento.contato,
        ocorrencia: editingAtendimento.ocorrencia
      });
    } else {
      setForm({
        atendente: userAtendente,
        dia: '',
        horaInicio: '',
        horaFim: '',
        loja: '',
        contato: '',
        ocorrencia: ''
      });
    }
  }, [editingAtendimento, userAtendente]);

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
    const url = editingAtendimento
      ? `${API_URL}/api/atendimentos/${editingAtendimento.id}`
      : `${API_URL}/api/atendimentos`;
    const method = editingAtendimento ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify(payload)
    })
      .then(r => {
        if (!r.ok) return Promise.reject();
        clearEditing && clearEditing();
        editingAtendimento ? onUpdate() : onAdd();
        setForm(f => ({ ...f, dia: '', horaInicio: '', horaFim: '', loja: '', contato: '', ocorrencia: '' }));
      })
      .catch(() => alert('Erro ao salvar atendimento.'));
  };

  return (
    <Paper elevation={3} sx={{ width: '100%' }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Typography variant="h6">
            {editingAtendimento ? 'Editar Atendimento' : 'Cadastrar Atendimento'}
          </Typography>
        </Box>

        <TextField
          name="atendente"
          label="Atendente"
          value={form.atendente}
          disabled
          fullWidth
          sx={{ flex: '1 1 200px' }}
        />
        <TextField
          name="dia"
          label="Data"
          type="date"
          required
          InputLabelProps={{ shrink: true }}
          value={form.dia}
          onChange={handleChange}
          sx={{ flex: '1 1 150px' }}
        />
        <TextField
          name="horaInicio"
          label="Hora Início"
          type="time"
          required
          InputLabelProps={{ shrink: true }}
          value={form.horaInicio}
          onChange={handleChange}
          sx={{ flex: '1 1 120px' }}
        />
        <TextField
          name="horaFim"
          label="Hora Fim"
          type="time"
          required
          InputLabelProps={{ shrink: true }}
          value={form.horaFim}
          onChange={handleChange}
          sx={{ flex: '1 1 120px' }}
        />
        <TextField
          select
          name="loja"
          label="Loja"
          value={form.loja}
          onChange={handleChange}
          sx={{ flex: '1 1 150px' }}
        >
          {opts.lojas.map(loja => (
            <MenuItem key={loja} value={loja}>
              {loja}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          name="contato"
          label="Contato"
          value={form.contato}
          onChange={handleChange}
          sx={{ flex: '1 1 150px' }}
        >
          {opts.contatos.map(c => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          name="ocorrencia"
          label="Ocorrência"
          value={form.ocorrencia}
          onChange={handleChange}
          sx={{ flex: '1 1 150px' }}
        >
          {opts.ocorrencias.map(o => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </TextField>

        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{ flex: '0 0 auto' }}
        >
          {editingAtendimento ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </Box>
    </Paper>
  );
}
