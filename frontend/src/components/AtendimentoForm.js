// frontend/src/components/AtendimentoForm.js
import React, { useState, useEffect } from 'react';
import {
  Paper, Box, Grid, TextField,
  Button, Typography, MenuItem
} from '@mui/material';
import API_URL from '../config';

export default function AtendimentoForm({ token, onAdd }) {
  const [form, setForm] = useState({
    atendente: '', dia: '', horaInicio: '',
    horaFim: '', loja: '', contato: '', ocorrencia: ''
  });
  const [opts, setOpts] = useState({ lojas: [], contatos: [], ocorrencias: [] });

  useEffect(() => {
    fetch(`${API_URL}/api/categories`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(data => setOpts(data));
  }, [token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    fetch(`${API_URL}/api/atendimentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({
        atendente: form.atendente,
        dia: form.dia,
        horaInicio: form.horaInicio,
        horaFim: form.horaFim,
        loja: form.loja,
        contato: form.contato,
        ocorrencia: form.ocorrencia
      })
    }).then(() => {
      setForm({ atendente: '', dia: '', horaInicio: '', horaFim: '', loja: '', contato: '', ocorrencia: '' });
      onAdd();
    });
  };

  return (
    <Paper>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Typography variant="h6">Cadastrar Atendimento</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Atendente"
              name="atendente"
              value={form.atendente}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="Data"
              name="dia"
              type="date"
              value={form.dia}
              InputLabelProps={{ shrink: true }}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="Hora Início"
              name="horaInicio"
              type="time"
              value={form.horaInicio}
              InputLabelProps={{ shrink: true }}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="Hora Fim"
              name="horaFim"
              type="time"
              value={form.horaFim}
              InputLabelProps={{ shrink: true }}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Loja"
              name="loja"
              value={form.loja}
              onChange={handleChange}
              fullWidth
              required
            >
              {opts.lojas.map(loja => (
                <MenuItem key={loja} value={loja}>{loja}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Contato"
              name="contato"
              value={form.contato}
              onChange={handleChange}
              fullWidth
              required
            >
              {opts.contatos.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Ocorrência"
              name="ocorrencia"
              value={form.ocorrencia}
              onChange={handleChange}
              fullWidth
              required
            >
              {opts.ocorrencias.map(o => (
                <MenuItem key={o} value={o}>{o}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} display="flex" justifyContent="flex-end" alignItems="center">
            <Button type="submit" variant="contained" size="large">
              Cadastrar
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
