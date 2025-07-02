// frontend/src/components/AtendimentoForm.js
import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import {
  Box, TextField, Button, Typography,
  FormControl, InputLabel, Select, MenuItem, Stack
} from '@mui/material';

export default function AtendimentoForm({
  token,
  atendente,
  editing,
  onSave,
  onCancel
}) {
  const today = new Date().toISOString().slice(0, 10);
  const empty = { dia: today, hora_inicio: '', hora_fim: '', loja: '', contato: '', ocorrencia: '' };
  const [form, setForm] = useState(empty);
  const [lojas, setLojas] = useState([]);
  const [contatos, setContatos] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    // busca dropdowns
    fetch(`${API_URL}/api/categories?type=loja`, { headers })
      .then(r => r.json()).then(setLojas);
    fetch(`${API_URL}/api/categories?type=contato`, { headers })
      .then(r => r.json()).then(setContatos);
    fetch(`${API_URL}/api/categories?type=ocorrencia`, { headers })
      .then(r => r.json()).then(setOcorrencias);
  }, [token]);

  useEffect(() => {
    if (editing) {
      setForm({
        dia: editing.dia.split('T')[0],
        hora_inicio: editing.hora_inicio,
        hora_fim: editing.hora_fim,
        loja: editing.loja,
        contato: editing.contato,
        ocorrencia: editing.ocorrencia
      });
    } else {
      setForm(empty);
    }
  }, [editing]);

  const isValid = Object.values(form).every(v => v);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing
      ? `${API_URL}/api/atendimentos/${editing.id}`
      : `${API_URL}/api/atendimentos`;
    const body = { atendente, sector: editing?.sector || '', ...form };
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      return alert('Erro ao salvar atendimento');
    }
    onSave();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {editing ? 'Editar Atendimento' : 'Novo Atendimento'}
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Data *"
          name="dia"
          type="date"
          value={form.dia}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Hora Início *"
          name="hora_inicio"
          type="time"
          value={form.hora_inicio}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Hora Fim *"
          name="hora_fim"
          type="time"
          value={form.hora_fim}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />

        <FormControl required>
          <InputLabel>Loja</InputLabel>
          <Select
            name="loja"
            value={form.loja}
            onChange={handleChange}
            label="Loja"
          >
            {lojas.map(l => (
              <MenuItem key={l.id} value={l.name}>{l.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl required>
          <InputLabel>Contato</InputLabel>
          <Select
            name="contato"
            value={form.contato}
            onChange={handleChange}
            label="Contato"
          >
            {contatos.map(c => (
              <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl required>
          <InputLabel>Ocorrência</InputLabel>
          <Select
            name="ocorrencia"
            value={form.ocorrencia}
            onChange={handleChange}
            label="Ocorrência"
          >
            {ocorrencias.map(o => (
              <MenuItem key={o.id} value={o.name}>{o.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid}
          >
            {editing ? 'Atualizar' : 'Cadastrar'}
          </Button>
          {editing && (
            <Button variant="outlined" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
