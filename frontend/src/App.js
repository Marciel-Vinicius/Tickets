// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  Container,
  TextField,
  Button,
  Grid
} from '@mui/material';
import { styled, ThemeProvider } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
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
import ReportDashboard from './components/ReportDashboard';

const drawerWidth = 240;

const StyledPaper = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  backgroundColor: theme.palette.background.paper,
}));

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(
      decodeURIComponent(
        json
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );
  } catch {
    return null;
  }
}

export default function App() {
  // Theme
  const [mode, setMode] = useState(localStorage.getItem('mode') || 'light');
  const theme = mode === 'light' ? lightTheme : darkTheme;
  const toggleColorMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    localStorage.setItem('mode', next);
  };

  // Auth
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

  // Atendimentos
  const [atendimentos, setAtendimentos] = useState([]);
  const [reportDate, setReportDate] = useState('');
  const [editingAtendimento, setEditingAtendimento] = useState(null);

  const fetchAtendimentos = () => {
    if (!token) return;
    fetch(`${API_URL}/api/atendimentos`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(data => setAtendimentos(data))
      .catch(() => alert('Falha ao carregar atendimentos.'));
  };

  useEffect(() => {
    if (token) fetchAtendimentos();
  }, [token]);

  const generateReport = () => {
    if (!reportDate) return alert('Selecione uma data');
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

  const drawer = (
    <>
      <Toolbar>
        <Typography variant="h6">Menu</Typography>
      </Toolbar>
      <Divider />
      <List>
        {[
          { key: 'atendimentos', icon: <EventIcon />, label: 'Atendimentos' },
          {
            key: 'categories',
            icon: <CategoryIcon />,
            label: 'Categorias',
            auth: ['DEV', 'SAF'].includes(user?.sector)
          },
          {
            key: 'users',
            icon: <PeopleIcon />,
            label: 'Usuários',
            auth: user?.sector === 'DEV'
          },
          { key: 'reports', icon: <BarChartIcon />, label: 'Relatórios' }
        ].map(item => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              selected={view === item.key}
              onClick={() => {
                setView(item.key);
                setMobileOpen(false);
              }}
              disabled={item.auth === false}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AppBar
          position="fixed"
          sx={{
            zIndex: t => t.zIndex.drawer + 1,
            ml: { md: `${drawerWidth}px` }
          }}
        >
          <Toolbar>
            {user && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(v => !v)}
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

        {user && (
          <Drawer
            variant="permanent"
            open
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
            }}
          >
            {drawer}
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` }
          }}
        >
          {!user ? (
            <Container
              maxWidth="xs"
              sx={{
                mt: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
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
                  {/* FORMULÁRIO em tela inteira */}
                  <Grid item xs={12}>
                    <StyledPaper>
                      <AtendimentoForm
                        token={token}
                        onAdd={fetchAtendimentos}
                        onUpdate={fetchAtendimentos}
                      />
                    </StyledPaper>
                  </Grid>

                  {/* LISTA em tela inteira */}
                  <Grid item xs={12}>
                    <StyledPaper>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2
                        }}
                      >
                        <Typography variant="h6">Atendimentos</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
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
                      <AtendimentoList token={token} />
                    </StyledPaper>
                  </Grid>
                </Grid>
              )}

              {view === 'categories' && (
                <StyledPaper>
                  <CategoryManagement token={token} />
                </StyledPaper>
              )}
              {view === 'users' && (
                <StyledPaper>
                  <UserManagement token={token} />
                </StyledPaper>
              )}
              {view === 'reports' && (
                <StyledPaper>
                  <ReportDashboard token={token} />
                </StyledPaper>
              )}
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
