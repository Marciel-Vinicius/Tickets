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
  editingAtendimento,
  onAdd,
  onUpdate,
  clearEditing
}) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    atendente: userAtendente || '',
    dia: today,
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
      .then(setOpts)
      .catch(console.error);
  }, [token]);

  // preenche form ao editar, ou reseta componente
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
      setForm(f => ({
        ...f,
        dia: today,
        horaInicio: '',
        horaFim: '',
        loja: '',
        contato: '',
        ocorrencia: ''
      }));
    }
  }, [editingAtendimento, today]);

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
    const url = isEdit
      ? `${API_URL}/api/atendimentos/${editingAtendimento.id}`
      : `${API_URL}/api/atendimentos`;
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify(payload)
    })
      .then(r => {
        if (!r.ok) throw new Error();
        clearEditing();
        isEdit ? onUpdate() : onAdd();
        setForm(f => ({
          ...f,
          dia: today,
          horaInicio: '',
          horaFim: '',
          loja: '',
          contato: '',
          ocorrencia: ''
        }));
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
          {opts.lojas.map(({ value }) => (
            <MenuItem key={value} value={value}>
              {value}
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
          {opts.contatos
            .filter(c => c.active)
            .map(({ value }) => (
              <MenuItem key={value} value={value}>
                {value}
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
          {opts.ocorrencias.map(({ value }) => (
            <MenuItem key={value} value={value}>
              {value}
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
