// frontend/src/components/AtendimentoForm.js
import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import {
  Box, TextField, Button, Typography,
  FormControl, InputLabel, Select, MenuItem, Stack
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

  // Carrega opções de categorias
  useEffect(() => {
    fetch(`${API_URL}/api/categories`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(data =>
        setOpts({
          lojas: data.lojas,
          contatos: data.contatos,
          ocorrencias: data.ocorrencias
        })
      )
      .catch(console.error);
  }, [token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const isValid =
    form.dia &&
    form.horaInicio &&
    form.horaFim &&
    form.loja &&
    form.contato &&
    form.ocorrencia;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isValid) return;

    // Monta o body explicitamente
    const body = {
      atendente,
      dia: form.dia,
      horaInicio: form.horaInicio,
      horaFim: form.horaFim,
      loja: form.loja,
      contato: form.contato,
      ocorrencia: form.ocorrencia
    };

    try {
      const res = await fetch(`${API_URL}/api/atendimentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        // lê a mensagem de erro em texto bruto
        const text = await res.text();
        alert(`Erro ao cadastrar: ${res.status} ${text}`);
        return;
      }
      // sucesso → limpa e atualiza a lista
      setForm({
        dia: today,
        horaInicio: '',
        horaFim: '',
        loja: '',
        contato: '',
        ocorrencia: ''
      });
      onAdd();
    } catch {
      alert('Erro de conexão ao servidor');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Typography variant="h6" align="center">Novo Atendimento</Typography>
        <TextField
          label="Atendente"
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
            label="Loja"
            onChange={handleChange}
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
            label="Contato"
            onChange={handleChange}
          >
            {opts.contatos.map(c => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
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
            {opts.ocorrencias.map(o => (
              <MenuItem key={o} value={o}>{o}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          disabled={!isValid}
          fullWidth
        >
          Cadastrar
        </Button>
      </Stack>
    </Box>
  );
}
// Criar