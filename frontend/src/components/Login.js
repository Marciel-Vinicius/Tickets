import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography } from '@mui/material';

export default function Login({ onLogin, showRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => {
        if (!res.ok) throw new Error('Credenciais inválidas');
        return res.json();
      })
      .then(data => onLogin(data.token))
      .catch(() => alert('Usuário ou senha incorretos.'));
  };

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Login</Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Usuário"
            fullWidth
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <TextField
            label="Senha"
            type="password"
            fullWidth
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained">Entrar</Button>
          <Button variant="text" onClick={showRegister}>Criar conta</Button>
        </Box>
      </CardContent>
    </Card>
  );
}
