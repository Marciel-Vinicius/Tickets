// src/components/Login.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string, boolean } from 'yup';
import { Box, TextField, Button, Typography, FormControlLabel, Checkbox, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const schema = object({
  username: string().required('Obrigatório'),
  password: string().required('Obrigatório'),
  remember: boolean()
});

export default function Login() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });
  const [error, setError] = React.useState(null);

  const onSubmit = async data => {
    setError(null);
    try {
      await login({ username: data.username, password: data.password }, data.remember);
    } catch {
      setError('Usuário ou senha inválidos');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 4, width: '100%' }}>
      <Typography variant="h5" align="center" gutterBottom>Login</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        fullWidth label="Usuário" margin="normal"
        {...register('username')}
        error={!!errors.username}
        helperText={errors.username?.message}
      />
      <TextField
        fullWidth label="Senha" type="password" margin="normal"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
      />
      <FormControlLabel
        control={<Checkbox {...register('remember')} />}
        label="Lembrar-me"
      />
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
        Entrar
      </Button>
      <Button fullWidth sx={{ mt: 1 }} href="/register">
        Criar conta
      </Button>
    </Box>
  );
}
