// frontend/src/components/Login.js
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import API_URL from '../config';

export default function Login({ onLogin, showRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error('Credenciais inválidas');
      const { token } = await res.json();
      onLogin(token, remember);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}
      sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5">Entrar</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Usuário"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
      <TextField
        label="Senha"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label>
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
          /> Lembrar-me
        </label>
        <Button type="submit" variant="contained">Login</Button>
      </Box>
      <Button variant="text" onClick={showRegister}>Registrar-se</Button>
    </Box>
  );
}
