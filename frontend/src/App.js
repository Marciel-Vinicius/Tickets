// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  CssBaseline, AppBar, Toolbar, Typography, IconButton,
  Box, Divider, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Drawer, Container,
  TextField, Button, Grid
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
import apiFetch from './api';

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
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function App() {
  // theme
  const [mode, setMode] = useState(localStorage.getItem('mode') || 'light');
  const theme = mode === 'light' ? lightTheme : darkTheme;
  const toggleColorMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    localStorage.setItem('mode', next);
  };

  // auth
  const [token, setToken] = useState(
    localStorage.getItem('token') || sessionStorage.getItem('token')
  );
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [mobileOpen, setMobileOpen] = useState(false);

  // atendimentos
  const [atendimentos, setAtendimentos] = useState([]);
  const [reportDate, setReportDate] = useState('');
  const [editingAtendimento, setEditingAtendimento] = useState(null);

  // fetch atendimentos
  const fetchAtendimentos = useCallback(() => {
    if (!token) return;
    apiFetch('/atendimentos')
      .then(setAtendimentos)
      .catch(() => {/* already handles 401 */ });
  }, [token]);

  // on login/logout
  useEffect(() => {
    if (token) {
      const u = parseJwt(token);
      setUser(u);
      setView('atendimentos');
      fetchAtendimentos();
    } else {
      setUser(null);
      setView('login');
    }
  }, [token, fetchAtendimentos]);

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

  const handleDelete = id => {
    if (!window.confirm('Confirma exclusão?')) return;
    apiFetch(`/atendimentos/${id}`, { method: 'DELETE' })
      .then(fetchAtendimentos)
      .catch(() => { });
  };

  const generateReport = () => {
    if (!reportDate) return alert('Selecione uma data');
    apiFetch(`/atendimentos/report?date=${reportDate}`)
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

  // menu items: Usuários só p/ DEV
  const menuItems = [
    { key: 'atendimentos', icon: <EventIcon />, label: 'Atendimentos' },
    { key: 'categories', icon: <CategoryIcon />, label: 'Categorias' },
    user?.sector === 'DEV' && { key: 'users', icon: <PeopleIcon />, label: 'Usuários' },
    { key: 'reports', icon: <BarChartIcon />, label: 'Relatórios' }
  ].filter(Boolean);

  const drawer = (
    <>
      <Toolbar><Typography variant="h6">Menu</Typography></Toolbar>
      <Divider />
      <List>
        {menuItems.map(i => (
          <ListItem key={i.key} disablePadding>
            <ListItemButton
              selected={view === i.key}
              onClick={() => { setView(i.key); setMobileOpen(false); }}
            >
              <ListItemIcon>{i.icon}</ListItemIcon>
              <ListItemText primary={i.label} />
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
        <AppBar position="fixed" sx={{
          zIndex: t => t.zIndex.drawer + 1,
          ml: { md: `${drawerWidth}px` }
        }}>
          <Toolbar>
            {user && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(o => !o)}
                sx={{ mr: 2, display: { md: 'none' } }}
              ><MenuIcon /></IconButton>
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
          <Drawer variant="permanent" open sx={{
            width: drawerWidth, flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
          }}>
            {drawer}
          </Drawer>
        )}

        <Box component="main" sx={{
          flexGrow: 1, p: 3, mt: 8,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` }
        }}>
          {!user ? (
            <Container maxWidth="xs" sx={{
              mt: 8, display: 'flex',
              flexDirection: 'column', alignItems: 'center', gap: 2
            }}>
              {view === 'login'
                ? <Login onLogin={handleLogin} showRegister={() => setView('register')} />
                : <Register showLogin={() => setView('login')} />}
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
                      <Box sx={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', mb: 2
                      }}>
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
                        token={token}
                        onEdit={row => setEditingAtendimento(row)}
                        onDelete={handleDelete}
                      />
                    </StyledPaper>
                  </Grid>
                </Grid>
              )}
              {view === 'categories' && <StyledPaper><CategoryManagement token={token} /></StyledPaper>}
              {view === 'users' && <StyledPaper><UserManagement token={token} /></StyledPaper>}
              {view === 'reports' && <StyledPaper><ReportDashboard token={token} /></StyledPaper>}
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
