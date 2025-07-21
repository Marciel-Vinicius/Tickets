// frontend/src/App.js
import React, { useState, useEffect, useRef } from 'react';
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
  const [mode, setMode] = useState(localStorage.getItem('mode') || 'light');
  const theme = mode === 'light' ? lightTheme : darkTheme;
  const toggleColorMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    localStorage.setItem('mode', next);
  };

  const [token, setToken] = useState(
    localStorage.getItem('token') || sessionStorage.getItem('token')
  );
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [mobileOpen, setMobileOpen] = useState(false);

  // referência do timer de logout
  const logoutTimer = useRef(null);

  // sempre que token mudar, define usuário e view
  useEffect(() => {
    if (token) {
      setUser(parseJwt(token));
      setView('atendimentos');
    } else {
      setUser(null);
      setView('login');
    }
  }, [token]);

  // dispara no login: guarda token e timestamp
  const handleLogin = (t, remember) => {
    const now = Date.now().toString();
    if (remember) {
      localStorage.setItem('token', t);
      localStorage.setItem('loginTime', now);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('loginTime');
    } else {
      sessionStorage.setItem('token', t);
      sessionStorage.setItem('loginTime', now);
      localStorage.removeItem('token');
      localStorage.removeItem('loginTime');
    }
    setToken(t);
  };

  // limpa tudo no logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loginTime');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('loginTime');
    setToken(null);
    setMobileOpen(false);
  };

  // agenda logout automático 1h após loginTime
  useEffect(() => {
    if (token) {
      // pega loginTime de onde estiver
      const storedTime =
        localStorage.getItem('loginTime') || sessionStorage.getItem('loginTime') || '0';
      const loginTime = parseInt(storedTime, 10);
      const elapsed = Date.now() - loginTime;
      const maxDur = 60 * 60 * 1000; // 1h em ms
      const remaining = maxDur - elapsed;

      if (remaining <= 0) {
        handleLogout();
      } else {
        logoutTimer.current = setTimeout(handleLogout, remaining);
      }
    }
    return () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
    };
  }, [token]);

  // opções de menu
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

  // estados e funções de atendimentos, relatórios etc.
  const [atendimentos, setAtendimentos] = useState([]);
  const [reportDate, setReportDate] = useState('');
  const [editingAtendimento, setEditingAtendimento] = useState(null);

  const fetchAtendimentos = () => {
    if (!token) return;
    fetch(`${API_URL}/api/atendimentos`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => {
        if (res.status === 401) {
          handleLogout();
          return Promise.reject();
        }
        return res.ok ? res.json() : Promise.reject();
      })
      .then(data => setAtendimentos(data))
      .catch(() => console.log('Falha ao carregar atendimentos.'));
  };

  useEffect(() => {
    if (token) fetchAtendimentos();
  }, [token]);

  const handleDelete = id => {
    if (!window.confirm('Confirma exclusão?')) return;
    fetch(`${API_URL}/api/atendimentos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
      if (res.status === 401) {
        handleLogout();
        return;
      }
      fetchAtendimentos();
    });
  };

  const generateReport = () => {
    if (!reportDate) return alert('Selecione uma data');
    fetch(`${API_URL}/api/atendimentos/report/${reportDate}`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => {
        if (res.status === 401) {
          handleLogout();
          return Promise.reject();
        }
        return res.ok ? res.blob() : Promise.reject();
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme => theme.zIndex.drawer + 1,
            ml: { md: `${drawerWidth}px` }
          }}
        >
          <Toolbar>
            {user && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(o => !o)}
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
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box'
              }
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
                  <Grid item xs={12}>
                    <StyledPaper>
                      <AtendimentoForm
                        token={token}
                        atendente={user.username}
                        editingAtendimento={editingAtendimento}
                        onAdd={fetchAtendimentos}
                        onUpdate={() => {
                          fetchAtendimentos();
                          setEditingAtendimento(null);
                        }}
                        clearEditing={() => setEditingAtendimento(null)}
                      />
                    </StyledPaper>
                  </Grid>
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
                      <AtendimentoList
                        atendimentos={atendimentos}
                        onEdit={row => setEditingAtendimento(row)}
                        onDelete={handleDelete}
                      />
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
