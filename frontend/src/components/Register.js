import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string, ref } from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const schema = object({
  username: string().required('Usuário é obrigatório'),
  password: string().required('Senha é obrigatória'),
  confirmPassword: string()
    .oneOf([ref('password')], 'Senhas não coincidem')
    .required('Confirmação é obrigatória'),
  sector: string().required('Setor é obrigatório')
});

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });
  const [error, setError] = React.useState('');

  const onSubmit = async data => {
    setError('');
    try {
      await registerUser({
        username: data.username,
        password: data.password,
        sector: data.sector
      });
      // após cadastro, redireciona ao login
      navigate('/login', { replace: true });
    } catch {
      setError('Falha ao cadastrar');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%', mt: 8, px: 2 }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Cadastrar
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        fullWidth
        label="Usuário"
        margin="normal"
        {...register('username')}
        error={!!errors.username}
        helperText={errors.username?.message}
      />
      <TextField
        fullWidth
        label="Senha"
        type="password"
        margin="normal"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
      />
      <TextField
        fullWidth
        label="Confirmar Senha"
        type="password"
        margin="normal"
        {...register('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
      />
      <TextField
        fullWidth
        label="Setor"
        margin="normal"
        {...register('sector')}
        error={!!errors.sector}
        helperText={errors.sector?.message}
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 2, py: 1.5 }}
      >
        Cadastrar
      </Button>
      <Button
        onClick={() => navigate('/login')}
        fullWidth
        sx={{ mt: 1 }}
      >
        Voltar ao Login
      </Button>
    </Box>
  );
}
