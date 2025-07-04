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

  // inicializa opts sempre como arrays vazios
  const [opts, setOpts] = useState({
    lojas: [],
    contatos: [],
    ocorrencias: []
  });

  // carrega categorias COM token no header
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/categories`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => {
        if (r.status === 401) {
          // token inválido: redireciona para login
          return window.location.href = '/';
        }
        if (!r.ok) return Promise.reject();
        return r.json();
      })
      .then(data => setOpts(data))
      .catch(err => {
        console.error('Falha ao carregar categorias', err);
        // garante que opts fique sempre definido
        setOpts({ lojas: [], contatos: [], ocorrencias: [] });
      });
  }, [token]);

  // o resto do form continua igual, usando opts.lojas, etc...
  const [form, setForm] = useState({
    atendente: userAtendente || '',
    dia: today,
    horaInicio: '',
    horaFim: '',
    loja: '',
    contato: '',
    ocorrencia: ''
  });

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
      setForm(f => ({ ...f, dia: today, horaInicio: '', horaFim: '', loja: '', contato: '', ocorrencia: '' }));
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
        if (r.status === 401) return window.location.href = '/';
        if (!r.ok) return Promise.reject();
        return r.json();
      })
      .then(() => {
        clearEditing && clearEditing();
        isEdit ? onUpdate() : onAdd();
        setForm(f => ({ ...f, dia: today, horaInicio: '', horaFim: '', loja: '', contato: '', ocorrencia: '' }));
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
