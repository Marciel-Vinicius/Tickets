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

const drawerWidth = 240;

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(
      decodeURIComponent(
        json.split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      )
    );
  } catch {
    return null;
  }
}

export default function App() {
  // Tema (light/dark)
  const [mode, setMode] = useState(localStorage.getItem('mode') || 'light');
  const theme = mode === 'light' ? lightTheme : darkTheme;
  const toggleColorMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    localStorage.setItem('mode', next);
  };

  // Auth & usuário
  const [token, setToken] = useState(
    localStorage.getItem('token') || sessionStorage.getItem('token')
  );
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (token) {
      setUser(parseJwt(token));
      setView('atendimentos');
    } else {
      setUser(null);
      setView('login');
    }
  }, [token]);

  const handleLogin = (t, remember) => {
    if (remember) {
      localStorage.setItem('token', t);
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', t);
      localStorage.removeItem('token');
    }
    setToken(t);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setToken(null);
    setMobileOpen(false);
  };

  // Atendimentos + 4º plantão
  const [atendimentos, setAtendimentos] = useState([]);
  const [reportDate, setReportDate] = useState('');

  const fetchAtendimentos = () => {
    if (!token) return;
    fetch(`${API_URL}/api/atendimentos`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => {
        if (!r.ok) throw new Error(`Status ${r.status}`);
        return r.json();
      })
      .then(raw => {
        // 1) ordenar por data crescente
        const sorted = [...raw].sort(
          (a, b) => new Date(a.dia) - new Date(b.dia)
        );
        // 2) computar 4º plantão e normalizar campos
        const saturdayCount = {};
        const processed = sorted.map(item => {
          saturdayCount[item.atendente] = saturdayCount[item.atendente] || 0;
          let observacao = '';
          if (new Date(item.dia).getDay() === 6) {
            saturdayCount[item.atendente]++;
            if (saturdayCount[item.atendente] === 4) {
              observacao = '4 plantão';
              saturdayCount[item.atendente] = 0;
            }
          }
          return {
            id: item.id,
            atendente: item.atendente,
            setor: item.setor,
            dia: item.dia,                // string "YYYY-MM-DD"
            horaInicio: item.hora_inicio,        // snake_case do SELECT
            horaFim: item.hora_fim,
            loja: item.loja,
            contato: item.contato,
            ocorrencia: item.ocorrencia,
            observacao
          };
        });
        setAtendimentos(processed);
      })
      .catch(err => {
        console.error(err);
        alert('Falha ao carregar atendimentos.');
      });
  };

  useEffect(() => {
    if (token) fetchAtendimentos();
  }, [token]);

  // Geração de PDF
  const generateReport = () => {
    if (!reportDate) return alert('Selecione uma data');
    fetch(
      `${API_URL}/api/atendimentos/report?date=${reportDate}`,
      { headers: { Authorization: 'Bearer ' + token } }
    )
      .then(r => {
        if (!r.ok) throw new Error();
        return r.blob();
      })
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

  // Drawer (menu lateral)
  const drawer = (
    <div>
      <Toolbar><Typography variant="h6">Navegação</Typography></Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={view === 'atendimentos'}
            onClick={() => { setView('atendimentos'); setMobileOpen(false); }}
          >
            <ListItemIcon><EventIcon /></ListItemIcon>
            <ListItemText primary="Atendimentos" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={view === 'categories'}
            onClick={() => { setView('categories'); setMobileOpen(false); }}
            disabled={!['DEV', 'SAF'].includes(user?.sector)}
          >
            <ListItemIcon><CategoryIcon /></ListItemIcon>
            <ListItemText primary="Categorias" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={view === 'users'}
            onClick={() => { setView('users'); setMobileOpen(false); }}
            disabled={user?.sector !== 'DEV'}
          >
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Usuários" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  const handleDrawerToggle = () => setMobileOpen(o => !o);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            zIndex: theme => theme.zIndex.drawer + 1
          }}
        >
          <Toolbar>
            {user && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
              Sistema de Atendimentos
            </Typography>
            <IconButton color="inherit" onClick={toggleColorMode}>
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Drawer */}
        {user && (
          <>
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { width: drawerWidth }
              }}
            >
              {drawer}
            </Drawer>
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', md: 'block' },
                '& .MuiDrawer-paper': { width: drawerWidth }
              }}
              open
            >
              {drawer}
            </Drawer>
          </>
        )}

        {/* Conteúdo */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` }
          }}
        >
          <Toolbar />

          {!user ? (
            <Container
              maxWidth="xs"
              sx={{
                mt: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {view === 'login' ? (
                <Login onLogin={handleLogin} showRegister={() => setView('register')} />
              ) : (
                <Register showLogin={() => setView('login')} />
              )}
            </Container>
          ) : (
            <>
              {view === 'atendimentos' && (
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                      <AtendimentoForm
                        token={token}
                        atendente={user.username}
                        onAdd={fetchAtendimentos}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
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
              {view === 'categories' && (
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                  <CategoryManagement token={token} />
                </Paper>
              )}
              {view === 'users' && user.sector === 'DEV' && (
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                  <UserManagement token={token} />
                </Paper>
              )}
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
