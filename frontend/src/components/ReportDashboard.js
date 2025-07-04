import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Paper, CircularProgress
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import API_URL from '../config';

const COLORS = [
    "#1976d2", "#d32f2f", "#388e3c", "#fbc02d", "#7b1fa2", "#0288d1", "#c2185b"
];

function CardChart({ title, children }) {
    return (
        <Paper elevation={3} sx={{
            height: 340, minWidth: 260, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2
        }}>
            <Typography variant="subtitle1" gutterBottom>{title}</Typography>
            <Box sx={{ flex: 1, width: '100%', height: '80%' }}>{children}</Box>
        </Paper>
    );
}

export default function ReportDashboard({ token }) {
    const [summary, setSummary] = useState({});
    const [byUser, setByUser] = useState([]);
    const [byDay, setByDay] = useState([]);
    const [byStore, setByStore] = useState([]);
    const [byOccurrence, setByOccurrence] = useState([]);
    const [bySector, setBySector] = useState([]);
    const [byMonth, setByMonth] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(`${API_URL}/api/reports/summary`, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()),
            fetch(`${API_URL}/api/reports/byUser`, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()),
            fetch(`${API_URL}/api/reports/byDay`, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()),
            fetch(`${API_URL}/api/reports/byStore`, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()),
            fetch(`${API_URL}/api/reports/byOccurrence`, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()),
            fetch(`${API_URL}/api/reports/bySector`, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()),
            fetch(`${API_URL}/api/reports/byMonth`, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json())
        ]).then(([sum, user, day, store, occ, sector, month]) => {
            setSummary(sum);
            setByUser(user);
            setByDay(day.map(r => {
                const [y, m, d] = r.dia.split('-');
                return { ...r, dia: `${d}/${m}` };
            }));
            setByStore(store);
            setByOccurrence(occ);
            setBySector(sector);
            setByMonth(month.map(r => {
                const [y, m] = r.mes.split('-');
                return { ...r, mes: `${m}/${y}` };
            }));
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [token]);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
        </Box>
    );

    // Limita tamanho das legendas
    const formatPieLabel = (value) =>
        value.length > 13 ? value.slice(0, 10) + '...' : value;

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Painel de Relatórios</Typography>
            {/* Cards de resumo */}
            <Grid container spacing={2} mb={1}>
                {[{ title: 'Tempo Médio', value: summary?.averageTime || '-' },
                { title: 'Total Atend.', value: summary?.total || 0 },
                { title: 'Top Atendente', value: summary?.topAttendant ? `${summary.topAttendant} (${summary.topCount})` : '-' }
                ].map((c, i) => (
                    <Grid key={i} item xs={12} sm={6} md={4} lg={2.4}>
                        <Paper elevation={3} sx={{ p: 2, mb: 1 }}>
                            <Typography variant="subtitle1">{c.title}</Typography>
                            <Typography variant="h4">{c.value}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Linha 1 de gráficos */}
            <Grid container spacing={2} mb={1}>
                <Grid item xs={12} md={4}>
                    <CardChart title="Atendimentos por Usuário">
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={byUser}>
                                <XAxis dataKey="atendente" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#1976d2" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardChart>
                </Grid>
                <Grid item xs={12} md={4}>
                    <CardChart title="Atendimentos por Dia">
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={byDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dia" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#d32f2f" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardChart>
                </Grid>
                <Grid item xs={12} md={4}>
                    <CardChart title="Evolução Mensal (Últimos 6 Meses)">
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={byMonth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#fbc02d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardChart>
                </Grid>
            </Grid>

            {/* Linha 2 de gráficos */}
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <CardChart title="Top Lojas">
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={byStore}
                                    dataKey="count"
                                    nameKey="loja"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={65}
                                    label={({ loja }) => formatPieLabel(loja)}
                                >
                                    {byStore.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardChart>
                </Grid>
                <Grid item xs={12} md={4}>
                    <CardChart title="Top Ocorrências">
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={byOccurrence}
                                    dataKey="count"
                                    nameKey="ocorrencia"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={65}
                                    label={({ ocorrencia }) => formatPieLabel(ocorrencia)}
                                >
                                    {byOccurrence.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardChart>
                </Grid>
                <Grid item xs={12} md={4}>
                    <CardChart title="Atendimentos por Setor">
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={bySector}>
                                <XAxis dataKey="setor" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#388e3c" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardChart>
                </Grid>
            </Grid>
        </Box>
    );
}
