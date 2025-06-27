// frontend/src/components/AtendimentoForm.js
import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import {
  Paper, Box, TextField, Button, Typography,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

export default function AtendimentoForm({ onAdd, token, atendente }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    dia: today,
    horaInicio: '',
    horaFim: '',
    loja: '',
    contato: '',
    ocorrencia: ''
  });
  const [opts, setOpts] = useState({ lojas: [], contatos: [], ocorrencias: [] });

  useEffect(() => {
    fetch(`${API_URL}/api/categories`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(data => setOpts({
        lojas: data.lojas,
        contatos: data.contatos,
        ocorrencias: data.ocorrencias
      }))
      .catch(console.error);
  }, [token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    fetch(`${API_URL}/api/atendimentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ atendente, ...form })
    }).then(() => {
      setForm({ dia: today, horaInicio: '', horaFim: '', loja: '', contato: '', ocorrencia: '' });
      onAdd();
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Novo Atendimento</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
        <TextField label="Atendente" value={atendente} fullWidth disabled />
        <TextField
          label="Data" name="dia" type="date"
          value={form.dia} onChange={handleChange}
          InputLabelProps={{ shrink: true }} fullWidth
        />
        <TextField
          label="Hora Início" name="horaInicio" type="time"
          value={form.horaInicio} onChange={handleChange}
          InputLabelProps={{ shrink: true }} fullWidth
        />
        <TextField
          label="Hora Término" name="horaFim" type="time"
          value={form.horaFim} onChange={handleChange}
          InputLabelProps={{ shrink: true }} fullWidth
        />

        <FormControl fullWidth>
          <InputLabel id="loja-label">Loja</InputLabel>
          <Select
            labelId="loja-label" name="loja" value={form.loja}
            label="Loja" onChange={handleChange}
          >
            {opts.lojas.map(loja => (
              <MenuItem key={loja} value={loja}>{loja}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="contato-label">Contato</InputLabel>
          <Select
            labelId="contato-label" name="contato" value={form.contato}
            label="Contato" onChange={handleChange}
          >
            {opts.contatos.map(contato => (
              <MenuItem key={contato} value={contato}>{contato}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="ocorrencia-label">Ocorrência</InputLabel>
          <Select
            labelId="ocorrencia-label" name="ocorrencia" value={form.ocorrencia}
            label="Ocorrência" onChange={handleChange}
          >
            {opts.ocorrencias.map(o => (
              <MenuItem key={o} value={o}>{o}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained">Cadastrar</Button>
      </Box>
    </Paper>
  );
}
