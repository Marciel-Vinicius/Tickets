import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string, ref } from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const schema = object({
  username: string().required('Usuário é obrigatório'),
  password: string().required('Senha é obrigatória'),
  confirmPassword: string()
    .oneOf([ref('password')], 'As senhas devem coincidir')
    .required('Confirmação de senha é obrigatória'),
  sector: string().required('Setor é obrigatório')
});

export default function Register({ showLogin }) {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async data => {
    setError('');
    setLoading(true);
    try {
      await registerUser({
        username: data.username,
        password: data.password,
        sector: data.sector
      });
      showLogin();
    } catch {
      setError('Falha ao registrar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%', mt: 4 }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Cadastrar
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Controller
        name="username"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            fullWidth
            label="Usuário"
            margin="normal"
            error={!!errors.username}
            helperText={errors.username?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            fullWidth
            label="Senha"
            type="password"
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            fullWidth
            label="Confirmar Senha"
            type="password"
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="sector"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            fullWidth
            label="Setor"
            margin="normal"
            error={!!errors.sector}
            helperText={errors.sector?.message}
            {...field}
          />
        )}
      />

      <Box sx={{ position: 'relative', mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
        >
          Cadastrar
        </Button>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px'
            }}
          />
        )}
      </Box>

      <Button
        fullWidth
        sx={{ mt: 2 }}
        onClick={showLogin}
      >
        Voltar ao Login
      </Button>
    </Box>
  );
}
