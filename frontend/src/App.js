import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Button,
  Container, Box, CssBaseline, TextField, Paper, Grid
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

// parseJwt permanece igual...

export default function App() {
  // tema / auth unchanged...

  // atendimentos + observação de 4º plantão
  const [atendimentos, setAtendimentos] = useState([]);
  const fetchAtendimentos = () => {
    if (!token) return;
    fetch(`${API_URL}/api/atendimentos`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => {
        // 1) ordenar asc por data
        const sorted = [...data].sort((a, b) => new Date(a.dia) - new Date(b.dia));
        // 2) computar sábados
        const saturdayCount = {};
        const processed = sorted.map(item => {
          const user = item.atendente;
          if (!saturdayCount[user]) saturdayCount[user] = 0;
          const dt = new Date(item.dia);
          let observacao = '';
          if (dt.getDay() === 6) {
            saturdayCount[user]++;
            if (saturdayCount[user] === 4) {
              observacao = '4 plantão';
              saturdayCount[user] = 0;
            }
          }
          return { ...item, observacao };
        });
        setAtendimentos(processed);
      })
      .catch(() => alert('Falha ao conectar ao servidor.'));
  };
  useEffect(() => { if (token) fetchAtendimentos(); }, [token]);

  // relatório, login, logout, tema, etc. permanecem iguais...

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Top Bar unchanged... */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {!user ? (
          view === 'login'
            ? <Login onLogin={handleLogin} showRegister={() => setView('register')} />
            : <Register showLogin={() => setView('login')} />
        ) : (
          <>
            {view === 'atendimentos' && (
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <AtendimentoForm
                      onAdd={() => {
                        fetchAtendimentos();
                      }}
                      token={token}
                      atendente={user.username}
                    />
                  </Paper>
                </Grid>
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
                      <TextField
                        label="Data do Relatório"
                        type="date"
                        value={reportDate}
                        onChange={e => setReportDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
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
