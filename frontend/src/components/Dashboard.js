// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react'
import {
    Box, CssBaseline, AppBar, Toolbar, IconButton, Typography,
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Divider, Grid, Paper, TextField, Button, Container
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import EventIcon from '@mui/icons-material/Event'
import CategoryIcon from '@mui/icons-material/Category'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { useTheme } from '@mui/material/styles'

import { useAuth } from '../context/AuthContext'
import API_URL from '../config'
import AtendimentoForm from './AtendimentoForm'
import AtendimentoList from './AtendimentoList'
import CategoryManagement from './CategoryManagement'
import UserManagement from './UserManagement'
import ReportDashboard from './ReportDashboard'

const drawerWidth = 240

export default function Dashboard() {
    const theme = useTheme()
    const { token, user, logout } = useAuth()

    // theme toggle lifted from App.js if you passed toggle via context
    // otherwise remove this and icon

    const [mobileOpen, setMobileOpen] = useState(false)
    const [view, setView] = useState('atendimentos')
    const [atendimentos, setAtendimentos] = useState([])
    const [editingItem, setEditingItem] = useState(null)
    const [reportDate, setReportDate] = useState('')

    const handleDrawerToggle = () => setMobileOpen(o => !o)

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6">Menu</Typography>
            </Toolbar>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton
                        selected={view === 'atendimentos'}
                        onClick={() => setView('atendimentos')}
                    >
                        <ListItemIcon><EventIcon /></ListItemIcon>
                        <ListItemText primary="Atendimentos" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        selected={view === 'categories'}
                        onClick={() => setView('categories')}
                        disabled={!['DEV', 'SAF'].includes(user?.sector)}
                    >
                        <ListItemIcon><CategoryIcon /></ListItemIcon>
                        <ListItemText primary="Categorias" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        selected={view === 'users'}
                        onClick={() => setView('users')}
                        disabled={user?.sector !== 'DEV'}
                    >
                        <ListItemIcon><PeopleIcon /></ListItemIcon>
                        <ListItemText primary="Usuários" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        selected={view === 'reports'}
                        onClick={() => setView('reports')}
                    >
                        <ListItemIcon><BarChartIcon /></ListItemIcon>
                        <ListItemText primary="Relatórios" />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem disablePadding>
                    <ListItemButton onClick={logout}>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    )

    // fetch atendimentos
    const fetchAtendimentos = () => {
        fetch(`${API_URL}/api/atendimentos`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => {
                const sorted = data.sort(
                    (a, b) => new Date(a.dia) - new Date(b.dia)
                )
                setAtendimentos(sorted)
            })
            .catch(() => alert('Não foi possível carregar atendimentos'))
    }

    useEffect(() => {
        if (view === 'atendimentos') fetchAtendimentos()
    }, [view])

    const handleSave = () => {
        setEditingItem(null)
        fetchAtendimentos()
    }

    const generateReport = () => {
        if (!reportDate) return alert('Selecione uma data')
        fetch(`${API_URL}/api/atendimentos/report?date=${reportDate}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.blob() : Promise.reject())
            .then(blob => {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = `relatorio-${reportDate}.pdf`; a.click()
            })
            .catch(() => alert('Erro ao gerar relatório'))
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    zIndex: theme.zIndex.drawer + 1
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit" edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                        Sistema de Atendimentos
                    </Typography>
                    {/* optional: theme toggle */}
                    {/* <IconButton onClick={toggleMode}>
             {mode==='light'?<Brightness4Icon/>:<Brightness7Icon/>}
          </IconButton> */}
                </Toolbar>
            </AppBar>

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

                {view === 'atendimentos' && (
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, borderRadius: 2 }} elevation={3}>
                                <AtendimentoForm
                                    token={token}
                                    atendente={user.username}
                                    editing={editingItem}
                                    onSave={handleSave}
                                    onCancel={() => setEditingItem(null)}
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3, borderRadius: 2 }} elevation={3}>
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
                                            Gerar
                                        </Button>
                                    </Box>
                                </Box>
                                <AtendimentoList
                                    atendimentos={atendimentos}
                                    token={token}
                                    onDelete={() => fetchAtendimentos()}
                                    onEdit={item => setEditingItem(item)}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {view === 'categories' && (
                    <Paper sx={{ p: 3, borderRadius: 2 }} elevation={3}>
                        <CategoryManagement token={token} />
                    </Paper>
                )}

                {view === 'users' && user.sector === 'DEV' && (
                    <Paper sx={{ p: 3, borderRadius: 2 }} elevation={3}>
                        <UserManagement token={token} />
                    </Paper>
                )}

                {view === 'reports' && (
                    <Paper sx={{ p: 3, borderRadius: 2 }} elevation={3}>
                        <ReportDashboard token={token} />
                    </Paper>
                )}
            </Box>
        </Box>
    )
}
