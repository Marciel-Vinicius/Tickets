// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import {
  CssBaseline, AppBar, Toolbar, Typography,
  IconButton, Box, Divider, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText,
  Drawer, Container, TextField, Button, Paper,
  Grid
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import API_URL from './config';
import AtendimentoList from './components/AtendimentoList';
import AtendimentoForm from './components/AtendimentoForm';
import CategoryManagement from './components/CategoryManagement';
import UserManagement from './components/UserManagement';
import ReportDashboard from './components/ReportDashboard';
import Login from './components/Login';
import Register from './components/Register';
import theme from './theme';

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [atendimentos, setAtendimentos] = useState([]);
  const [editingAtendimento, setEditingAtendimento] = useState(null);
  const [reportDate, setReportDate] = useState('');

  const fetchAtendimentos = () => {
    if (!token) return;
    fetch(`${API_URL}/api/atendimentos`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(raw =>
        setAtendimentos(
          raw.map(item => ({
            ...item,
            horaInicio: item.hora_inicio,
            horaFim: item.hora_fim
          }))
        )
      )
      .catch(err => {
        console.error(err);
        alert('Falha ao carregar atendimentos.');
      });
  };

  useEffect(() => {
    if (token) fetchAtendimentos();
  }, [token]);

  // Handlers de login/usuário omitidos para brevidade…

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* AppBar/Drawer omitidos… */}

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {!user ? (
          <Container maxWidth="xs">
            {view === 'login' ? (
              <Login
                onLogin={(u, t) => {
                  setUser(u);
                  setToken(t);
                  setView('atendimentos');
                }}
                showRegister={() => setView('register')}
              />
            ) : (
              <Register showLogin={() => setView('login')} />
            )}
          </Container>
        ) : (
          <>
            {/* Menu lateral omitido… */}

            {view === 'atendimentos' && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <AtendimentoForm
                      onAdd={() => {
                        fetchAtendimentos();
                        setEditingAtendimento(null);
                      }}
                      onEditComplete={() => setEditingAtendimento(null)}
                      editingAtendimento={editingAtendimento}
                      token={token}
                      atendente={user.username}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <TextField
                        label="Data do Relatório"
                        type="date"
                        size="small"
                        value={reportDate}
                        onChange={e => setReportDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <Button
                        variant="contained"
                        onClick={() =>
                          window.open(
                            `${API_URL}/api/atendimentos/report?date=${reportDate}`,
                            '_blank'
                          )
                        }
                        sx={{ ml: 2 }}
                      >
                        Gerar Relatório
                      </Button>
                    </Box>
                    <AtendimentoList
                      atendimentos={atendimentos}
                      token={token}
                      onDelete={fetchAtendimentos}
                      onEdit={row => setEditingAtendimento(row)}
                    />
                  </Paper>
                </Grid>
              </Grid>
            )}

            {view === 'categories' && (
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <CategoryManagement token={token} />
              </Paper>
            )}

            {view === 'users' && (
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <UserManagement token={token} />
              </Paper>
            )}

            {view === 'reports' && (
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <ReportDashboard token={token} />
              </Paper>
            )}
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
