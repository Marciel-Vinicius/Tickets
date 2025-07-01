// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Container,
  Box,
  TextField,
  Paper,
  Grid
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { lightTheme, darkTheme } from './theme';

import API_URL from './config';
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

  // Atendimentos e Observação 4º plantão
  const [atendimentos, setAtendimentos] = useState([]);
  const [reportDate, setReportDate] = useState('');

  const fetchAtendimentos = () => {
    if (!token) return;
    fetch(`${API_URL}/api/atendimentos`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => {
        // Ordena asc por data
        const sorted = [...data].sort((a, b) => new Date(a.dia) - new Date(b.dia));
        // Conta sábados por usuário
        const saturdayCount = {};
        const processed = sorted.map(item => {
          const userKey = item.atendente;
          saturdayCount[userKey] = saturdayCount[userKey] || 0;
          const d = new Date(item.dia);
          let observacao = '';
          if (d.getDay() === 6) {
            saturdayCount[userKey]++;
            if (saturdayCount[userKey] === 4) {
              observacao = '4 plantão';
              saturdayCount[userKey] = 0;
            }
          }
          return { ...item, observacao };
        });
        setAtendimentos(processed);
      })
      .catch(() => alert('Falha ao conectar ao servidor.'));
  };

  useEffect(() => {
    if (token) fetchAtendimentos();
  }, [token]);

  // Geração de relatório em PDF
  const generateReport = () => {
    if (!reportDate) {
      alert('Selecione uma data');
      return;
    }
    fetch(`${API_URL}/api/atendimentos/report?date=${reportDate}`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => (r.ok ? r.blob() : Promise.reject()))
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-${reportDate}.pdf`;
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {!user ? (
          view === 'login' ? (
            <Login onLogin={handleLogin} showRegister={() => setView('register')} />
          ) : (
            <Register showLogin={() => setView('login')} />
          )
        ) : (
          <>
            {view === 'atendimentos' && (
              <Grid container spacing={4}>
                {/* Form */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <AtendimentoForm
                      onAdd={fetchAtendimentos}
                      token={token}
                      atendente={user.username}
                    />
                  </Paper>
                </Grid>

                {/* Lista + Relatório */}
                <Grid item xs={12} md={8}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2
                      }}
                    >
                      <Typography variant="h6">Atendimentos</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                          label="Data do Relatório"
                          type="date"
                          size="small"
                          value={reportDate}
                          onChange={e => setReportDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                        <Button variant="contained" onClick={generateReport}>
                          Gerar Relatório
                        </Button>
                      </Box>
                    </Box>
                    <AtendimentoList
                      atendimentos={atendimentos}
                      token={token}
                      onDelete={fetchAtendimentos}
                    />
                  </Paper>
                </Grid>
              </Grid>
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
