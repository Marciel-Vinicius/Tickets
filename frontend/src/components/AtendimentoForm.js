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
  editing,         // o atendimento que está sendo editado (objeto) ou null
  onSave,          // callback (novo ou atualizado)=>void
  onCancel         // callback para sair do modo edição
}) {
  const today = new Date().toISOString().split('T')[0];
  const initial = {
    dia: today,
    hora_inicio: '',
    hora_fim: '',
    loja: '',
    contato: '',
    ocorrencia: ''
  };

  const [form, setForm] = useState(initial);

  // quando entrar em modo edição, preenche o form
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
      setForm(initial);
    }
  }, [editing]);

  const isValid = Object.values(form).every(v => v !== '');

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

    const body = {
      atendente,
      sector: editing ? editing.sector : editing, // mantém setor original
      ...form
    };

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      return alert('Erro ao salvar atendimento');
    }

    onSave();
    setForm(initial);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {editing ? 'Editar Atendimento' : 'Novo Atendimento'}
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Data"
          name="dia"
          type="date"
          value={form.dia}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Hora Início"
          name="hora_inicio"
          type="time"
          value={form.hora_inicio}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Hora Fim"
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
          >
            {/* substitua pelas suas lojas fixas */}
            <MenuItem value="Loja A">Loja A</MenuItem>
            <MenuItem value="Loja B">Loja B</MenuItem>
            <MenuItem value="Loja C">Loja C</MenuItem>
          </Select>
        </FormControl>
        <FormControl required>
          <InputLabel>Contato</InputLabel>
          <Select
            name="contato"
            value={form.contato}
            onChange={handleChange}
          >
            {/* substitua pelos seus contatos fixos */}
            <MenuItem value="Contato 1">Contato 1</MenuItem>
            <MenuItem value="Contato 2">Contato 2</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Ocorrência"
          name="ocorrencia"
          multiline
          rows={3}
          value={form.ocorrencia}
          onChange={handleChange}
          required
        />
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
