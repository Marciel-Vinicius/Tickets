import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CircularProgress
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import API_URL from '../config';

const COLORS = ['#1976d2', '#d32f2f', '#388e3c', '#fbc02d', '#7b1fa2'];

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

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Painel de Relatórios</Typography>

            <Grid container spacing={3}>

                {/* Resumo geral */}
                {[
                    { title: 'Tempo Médio', value: summary?.averageTime || '-' },
                    { title: 'Total Atend.', value: summary?.total || 0 },
                    { title: 'Top Atendente', value: summary?.topAttendant ? `${summary.topAttendant} (${summary.topCount})` : '-' }
                ].map((c, i) => (
                    <Grid key={i} item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">{c.title}</Typography>
                                <Typography variant="h4">{c.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* Atendimentos por Usuário */}
                <Grid item xs={12} md={6} sx={{ height: 300 }}>
                    <Typography variant="subtitle1" gutterBottom>Atendimentos por Usuário</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={byUser}>
                            <XAxis dataKey="atendente" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#1976d2" />
                        </BarChart>
                    </ResponsiveContainer>
                </Grid>

                {/* Atendimentos por Dia */}
                <Grid item xs={12} md={6} sx={{ height: 300 }}>
                    <Typography variant="subtitle1" gutterBottom>Atendimentos por Dia</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={byDay}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="dia" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#d32f2f" />
                        </LineChart>
                    </ResponsiveContainer>
                </Grid>

                {/* NOVO: Atendimentos por Loja */}
                <Grid item xs={12} md={6} sx={{ height: 300 }}>
                    <Typography variant="subtitle1" gutterBottom>Top Lojas</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={byStore}
                                dataKey="count"
                                nameKey="loja"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ loja, percent }) => `${loja} (${(percent * 100).toFixed(0)}%)`}
                            >
                                {byStore.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Grid>

                {/* NOVO: Atendimentos por Ocorrência */}
                <Grid item xs={12} md={6} sx={{ height: 300 }}>
                    <Typography variant="subtitle1" gutterBottom>Top Ocorrências</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={byOccurrence}
                                dataKey="count"
                                nameKey="ocorrencia"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ ocorrencia, percent }) =>
                                    `${ocorrencia.slice(0, 12)}${ocorrencia.length > 12 ? '...' : ''} (${(percent * 100).toFixed(0)}%)`
                                }
                            >
                                {byOccurrence.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Grid>

                {/* NOVO: Atendimentos por Setor */}
                <Grid item xs={12} md={6} sx={{ height: 300 }}>
                    <Typography variant="subtitle1" gutterBottom>Atendimentos por Setor</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bySector}>
                            <XAxis dataKey="setor" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#388e3c" />
                        </BarChart>
                    </ResponsiveContainer>
                </Grid>

                {/* NOVO: Evolução mensal */}
                <Grid item xs={12} md={6} sx={{ height: 300 }}>
                    <Typography variant="subtitle1" gutterBottom>Evolução Mensal (Últimos 6 Meses)</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={byMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#fbc02d" />
                        </LineChart>
                    </ResponsiveContainer>
                </Grid>
            </Grid>
        </Box>
    );
}
