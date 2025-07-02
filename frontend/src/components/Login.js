import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string, boolean } from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const schema = object({
  username: string().required('Usuário é obrigatório'),
  password: string().required('Senha é obrigatória'),
  remember: boolean()
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { remember: false }
  });
  const [error, setError] = React.useState('');

  const onSubmit = async data => {
    setError('');
    try {
      await login(
        { username: data.username, password: data.password },
        data.remember
      );
      // após login bem-sucedido, vai para o dashboard
      navigate('/', { replace: true });
    } catch {
      setError('Usuário ou senha incorretos');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%', mt: 8, px: 2 }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Login
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
        autoComplete="username"
        {...register('username')}
        error={!!errors.username}
        helperText={errors.username?.message}
      />
      <TextField
        fullWidth
        label="Senha"
        type="password"
        margin="normal"
        autoComplete="current-password"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
      />
      <FormControlLabel
        control={<Checkbox {...register('remember')} />}
        label="Lembrar-me"
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 2, py: 1.5 }}
      >
        Entrar
      </Button>
      <Button
        component={RouterLink}
        to="/register"
        fullWidth
        sx={{ mt: 1 }}
      >
        Criar conta
      </Button>
    </Box>
  );
}
