// frontend/src/components/AtendimentoForm.js
import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import {
  Box, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Stack, Alert
} from '@mui/material';

export default function AtendimentoForm({
  onAdd,
  onUpdate,
  editingAtendimento,
  clearEditing,
  token,
  atendente
}) {
  const today = new Date().toISOString().split('T')[0];
  const initialState = {
    dia: today,
    horaInicio: '',
    horaFim: '',
    loja: '',
    contato: '',
    ocorrencia: ''
  };
  const [form, setForm] = useState(initialState);
  const [opts, setOpts] = useState({ lojas: [], contatos: [], ocorrencias: [] });
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Carrega opções de loja/contato/ocorrência
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

  // Quando entra em modo de edição, preenche o formulário
  useEffect(() => {
    if (editingAtendimento) {
      setForm({
        dia: editingAtendimento.dia.split('T')[0],
        horaInicio: editingAtendimento.horaInicio,
        horaFim: editingAtendimento.horaFim,
        loja: editingAtendimento.loja,
        contato: editingAtendimento.contato,
        ocorrencia: editingAtendimento.ocorrencia
      });
    } else {
      setForm(initialState);
    }
  }, [editingAtendimento]);

  // Limpa mensagens de feedback após 3s
  useEffect(() => {
    if (feedback.text) {
      const timer = setTimeout(() => setFeedback({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const isValid =
    form.dia &&
    form.horaInicio &&
    form.horaFim &&
    form.loja &&
    form.contato &&
    form.ocorrencia;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isValid) {
      setFeedback({ type: 'error', text: '❌ Preencha todos os campos obrigatórios.' });
      return;
    }
    const body = {
      atendente,
      dia: form.dia,
      horaInicio: form.horaInicio,
      horaFim: form.horaFim,
      loja: form.loja,
      contato: form.contato,
      ocorrencia: form.ocorrencia
    };
    const isEditing = !!editingAtendimento;
    const url = isEditing
      ? `${API_URL}/api/atendimentos/${editingAtendimento.id}`
      : `${API_URL}/api/atendimentos`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        setFeedback({ type: 'error', text: '❌ Erro ao salvar atendimento. Tente novamente.' });
        return;
      }
      setFeedback({ type: 'success', text: '✅ Atendimento salvo com sucesso!' });
      setForm(initialState);
      if (isEditing) {
        onUpdate();
        clearEditing();
      } else {
        onAdd();
      }
    } catch {
      setFeedback({ type: 'error', text: '❌ Erro de conexão ao servidor.' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      {feedback.text && (
        <Alert
          severity={feedback.type === 'error' ? 'error' : 'success'}
          sx={{ mb: 2 }}
        >
          {feedback.text}
        </Alert>
      )}
      <Stack spacing={2}>
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
          label="Hora de Início"
          name="horaInicio"
          type="time"
          value={form.horaInicio}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
          required
        />
        <TextField
          label="Hora de Término"
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
            onChange={handleChange}
            label="Loja"
          >
            {opts.lojas.map(loja => (
              <MenuItem key={loja} value={loja}>{loja}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth required>
          <InputLabel id="contato-label">Contato</InputLabel>
          <Select
            labelId="contato-label"
            name="contato"
            value={form.contato}
            onChange={handleChange}
            label="Contato"
          >
            {opts.contatos.map(cont => (
              <MenuItem key={cont} value={cont}>{cont}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth required>
          <InputLabel id="ocorrencia-label">Ocorrência</InputLabel>
          <Select
            labelId="ocorrencia-label"
            name="ocorrencia"
            value={form.ocorrencia}
            onChange={handleChange}
            label="Ocorrência"
          >
            {opts.ocorrencias.map(occ => (
              <MenuItem key={occ} value={occ}>{occ}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" fullWidth>
          {editingAtendimento ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </Stack>
    </Box>
  );
}
