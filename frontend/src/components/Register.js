// frontend/src/components/Register.js
import React, { useState } from 'react';
import API_URL from '../config';
import {
  Box, Card, CardContent, TextField,
  Button, Typography, FormControl,
  InputLabel, Select, MenuItem
} from '@mui/material';

export default function Register({ showLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sector, setSector] = useState('');
  const [message, setMessage] = useState('');
  // Criar
  const handleSubmit = e => {
    e.preventDefault();
    fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, sector })
    })
      .then(res => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status === 201) {
          setMessage('Conta criada! Faça login.');
          showLogin();
        } else {
          setMessage(body.message || 'Erro ao registrar');
        }
      })
      .catch(() => setMessage('Falha de conexão.'));
  };

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Registrar</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Usuário"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="sector-label">Setor</InputLabel>
            <Select
              labelId="sector-label"
              value={sector}
              label="Setor"
              onChange={e => setSector(e.target.value)}
            >
              <MenuItem value="DEV">DEV</MenuItem>
              <MenuItem value="SAF">SAF</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained">Registrar</Button>
          {message && <Typography color="error">{message}</Typography>}
          <Button variant="text" onClick={showLogin}>Voltar ao login</Button>
        </Box>
      </CardContent>
    </Card>
  );
}
