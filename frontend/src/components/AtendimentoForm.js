import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import {
  Box, TextField, Button,
  FormControl, InputLabel, Select, MenuItem,
  Stack, Alert, Typography
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
  const [opts, setOpts] = useState({
    lojas: [],
    contatos: [],
    ocorrencias: []
  });
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    fetch(`${API_URL}/api/categories`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => {
        if (!r.ok) throw new Error(`Status ${r.status}`);
        return r.json();
      })
      .then(data => {
        setOpts({
          lojas: Array.isArray(data.lojas) ? data.lojas : [],
          contatos: Array.isArray(data.contatos) ? data.contatos : [],
          ocorrencias: Array.isArray(data.ocorrencias)
            ? data.ocorrencias
            : []
        });
      })
      .catch(err => {
        console.error('Erro ao buscar categorias:', err);
        setOpts({ lojas: [], contatos: [], ocorrencias: [] });
        setFeedback({ type: 'error', text: 'Erro ao carregar opções.' });
      });
  }, [token]);

  useEffect(() => {
    if (!feedback.text) return;
    const timer = setTimeout(() => setFeedback({ type: '', text: '' }), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const isValid =
    form.dia &&
    form.horaInicio &&
    form.horaFim &&
    form.loja &&
    form.contato &&
    form.ocorrencia;

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isValid) {
      setFeedback({ type: 'error', text: '❌ Preencha todos os campos.' });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/atendimentos`, {
        method: 'POST',
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
          ocorrencia: form.ocorrencia
        })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setFeedback({ type: 'success', text: '✅ Atendimento salvo!' });
      setForm({
        dia: today,
        horaInicio: '',
        horaFim: '',
        loja: '',
        contato: '',
        ocorrencia: ''
      });
      onAdd();
    } catch (err) {
      console.error('Erro ao salvar atendimento:', err);
      setFeedback({ type: 'error', text: '❌ Erro ao salvar. Tente novamente.' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <Typography variant="h6">Novo Atendimento</Typography>
      {feedback.text && (
        <Alert severity={feedback.type} sx={{ mb: 2 }}>
          {feedback.text}
        </Alert>
      )}
      <Stack spacing={2}>
        <TextField
          label="Atendente"
          name="atendente"
          value={atendente}
          disabled
          fullWidth
        />
        <TextField
          label="Data"
          name="dia"
          type="date"
          value={form.dia}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
          required
        />
        <TextField
          label="Hora Início"
          name="horaInicio"
          type="time"
          value={form.horaInicio}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
          required
        />
        <TextField
          label="Hora Término"
          name="horaFim"
          type="time"
          value={form.horaFim}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
          required
        />

        <FormControl fullWidth required>
          <InputLabel id="loja-label">Loja</InputLabel>
          <Select
            labelId="loja-label"
            name="loja"
            value={form.loja}
            label="Loja"
            onChange={handleChange}
          >
            {Array.isArray(opts.lojas) &&
              opts.lojas.map(loja => (
                <MenuItem key={loja} value={loja}>
                  {loja}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl fullWidth required>
          <InputLabel id="contato-label">Contato</InputLabel>
          <Select
            labelId="contato-label"
            name="contato"
            value={form.contato}
            label="Contato"
            onChange={handleChange}
          >
            {Array.isArray(opts.contatos) &&
              opts.contatos.map(c => (
                <MenuItem key={c.id || c} value={c.nome || c}>
                  {c.nome || c}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl fullWidth required>
          <InputLabel id="ocorrencia-label">Ocorrência</InputLabel>
          <Select
            labelId="ocorrencia-label"
            name="ocorrencia"
            value={form.ocorrencia}
            label="Ocorrência"
            onChange={handleChange}
          >
            {Array.isArray(opts.ocorrencias) &&
              opts.ocorrencias.map(o => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" disabled={!isValid}>
          Cadastrar
        </Button>
      </Stack>
    </Box>
  );
}
