// frontend/src/components/AtendimentoForm.js
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography
} from '@mui/material';
import API_URL from '../config';

export default function AtendimentoForm({ token, onAdd, onUpdate, editingAtendimento, clearEditing }) {
  const [form, setForm] = useState({
    atendente: '',
    dia: '',
    horaInicio: '',
    horaFim: '',
    loja: '',
    contato: '',
    ocorrencia: ''
  });
  const [opts, setOpts] = useState({ lojas: [], contatos: [], ocorrencias: [] });

  // carrega opções de categorias
  useEffect(() => {
    fetch(`${API_URL}/api/categories`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(data => setOpts(data))
      .catch(console.error);
  }, [token]);

  // se veio para editar, pré-enche form
  useEffect(() => {
    if (editingAtendimento) {
      setForm({
        atendente: editingAtendimento.atendente || '',
        dia: editingAtendimento.dia || '',
        horaInicio: editingAtendimento.horaInicio || '',
        horaFim: editingAtendimento.horaFim || '',
        loja: editingAtendimento.loja || '',
        contato: editingAtendimento.contato || '',
        ocorrencia: editingAtendimento.ocorrencia || ''
      });
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
        onAdd ? onAdd() : onUpdate();
        setForm({
          atendente: '',
          dia: '',
          horaInicio: '',
          horaFim: '',
          loja: '',
          contato: '',
          ocorrencia: ''
        });
      })
      .catch(() => alert('Erro ao salvar atendimento.'));
  };

  return (
    <Paper elevation={3}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 3 }}
      >
        <Typography variant="h6" gutterBottom>
          {editingAtendimento ? 'Editar Atendimento' : 'Cadastrar Atendimento'}
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              required
              label="Atendente"
              name="atendente"
              value={form.atendente}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              required
              label="Data"
              name="dia"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.dia}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              required
              label="Hora Início"
              name="horaInicio"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={form.horaInicio}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              required
              label="Hora Fim"
              name="horaFim"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={form.horaFim}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={1}>
            <TextField
              fullWidth
              select
              label="Loja"
              name="loja"
              value={form.loja}
              onChange={handleChange}
            >
              {opts.lojas.map(loja => (
                <MenuItem key={loja} value={loja}>
                  {loja}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={1}>
            <TextField
              fullWidth
              select
              label="Contato"
              name="contato"
              value={form.contato}
              onChange={handleChange}
            >
              {opts.contatos.map(c => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={1}>
            <TextField
              fullWidth
              select
              label="Ocorrência"
              name="ocorrencia"
              value={form.ocorrencia}
              onChange={handleChange}
            >
              {opts.ocorrencias.map(o => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
            >
              {editingAtendimento ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
