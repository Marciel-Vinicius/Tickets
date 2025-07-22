import React, { useState } from 'react';
import API_URL from '../config';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Login({ onLogin, showRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
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
      if (!res.ok) throw new Error();
      const { token } = await res.json();
      onLogin(token, remember);
    } catch {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <Card sx={{ width: 360, maxWidth: '100%' }}>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'grid', gap: 2, mt: 1 }}
        >
          <TextField
            label="Usuário"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Senha"
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowPwd(s => !s)}
                  >
                    {showPwd ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
            }
            label="Lembrar-me"
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" fullWidth>
            Entrar
          </Button>
          <Button variant="text" fullWidth onClick={showRegister}>
            Criar uma conta
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
// Cria