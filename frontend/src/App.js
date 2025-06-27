import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Button,
  Container, Box, CssBaseline, TextField, Paper
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { lightTheme, darkTheme } from './theme';

import Login from './components/Login';
import Register from './components/Register';
import AtendimentoForm from './components/AtendimentoForm';
import AtendimentoList from './components/AtendimentoList';
import UserManagement from './components/UserManagement';
import CategoryManagement from './components/CategoryManagement';

// Parsing seguro de JWT
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function App() {
  // Tema
  const [mode, setMode] = useState(localStorage.getItem('mode') || 'light');
  const theme = mode === 'light' ? lightTheme : darkTheme;
  const toggleColorMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    localStorage.setItem('mode', next);
  };

  // Autenticação
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');

  useEffect(() => {
    if (token) {
      setUser(parseJwt(token));
      localStorage.setItem('token', token);
      setView('atendimentos');
    } else {
      setUser(null);
      localStorage.removeItem('token');
      setView('login');
    }
  }, [token]);

  const handleLogin = t => setToken(t);
  const handleLogout = () => setToken(null);

  // Atendimentos
  const [atendimentos, setAtendimentos] = useState([]);
  const fetchAtendimentos = () => {
    if (!token) return;
    fetch('http://localhost:3001/api/atendimentos', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setAtendimentos)
      .catch(() => alert('Falha ao conectar ao servidor.'));
  };
  useEffect(() => { if (token) fetchAtendimentos(); }, [token]);

  // Relatório
  const [reportDate, setReportDate] = useState('');
  const generateReport = () => {
    if (!reportDate) {
      alert('Selecione uma data');
      return;
    }
    fetch(
      `http://localhost:3001/api/atendimentos/report?date=${reportDate}`,
      { headers: { Authorization: 'Bearer ' + token } }
    )
      .then(res => {
        if (!res.ok) throw new Error();
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plantao-${reportDate}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert('Erro ao gerar relatório'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Top Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Sistema de Atendimentos
          </Typography>
          <IconButton color="inherit" onClick={toggleColorMode}>
            {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
          {user && (
            <>
              <Button color="inherit" onClick={() => setView('atendimentos')}>
                Atendimentos
              </Button>
              {user.sector === 'DEV' && (
                <>
                  <Button color="inherit" onClick={() => setView('users')}>
                    Usuários
                  </Button>
                  <Button color="inherit" onClick={() => setView('categories')}>
                    Categorias
                  </Button>
                </>
              )}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Conteúdo */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {!user ? (
          view === 'login' ? (
            <Login onLogin={handleLogin} showRegister={() => setView('register')} />
          ) : (
            <Register showLogin={() => setView('login')} />
          )
        ) : (
          <>
            {view === 'atendimentos' && (
              <Box display="flex" flexDirection="column" gap={4}>
                {/* Form */}
                <Box display="flex" justifyContent="center">
                  <AtendimentoForm
                    onAdd={fetchAtendimentos}
                    token={token}
                    atendente={user.username}
                  />
                </Box>

                {/* Lista + Relatório */}
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Atendimentos
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2
                    }}
                  >
                    <TextField
                      label="Data do Relatório"
                      type="date"
                      value={reportDate}
                      onChange={e => setReportDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <Button variant="contained" onClick={generateReport}>
                      Gerar Relatório
                    </Button>
                  </Box>
                  <AtendimentoList
                    atendimentos={atendimentos}
                    token={token}
                    onDelete={fetchAtendimentos}
                  />
                </Paper>
              </Box>
            )}
            {view === 'users' && user.sector === 'DEV' && (
              <UserManagement token={token} />
            )}
            {view === 'categories' && user.sector === 'DEV' && (
              <CategoryManagement token={token} />
            )}
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}
