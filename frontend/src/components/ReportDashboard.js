import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Paper, CircularProgress
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import API_URL from '../config';

// Paleta de cores para as fatias
const COLORS = [
    "#1976d2", "#d32f2f", "#388e3c", "#fbc02d", "#7b1fa2", "#0288d1", "#c2185b"
];

// Legenda customizada para PieChart (em linha, fonte pequena)
function CustomLegend(props) {
    const { payload } = props;
    return (
        <ul style={{
            listStyle: "none",
            margin: "8px 0 0 0",
            padding: 0,
            fontSize: 12,
            lineHeight: "16px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center"
        }}>
            {payload && payload.map((entry, i) => (
                <li key={`item-${i}`} style={{ color: entry.color, marginRight: 18, marginBottom: 3 }}>
                    <span style={{ marginRight: 4, verticalAlign: "middle" }}>■</span>
                    {entry.value.length > 13 ? entry.value.slice(0, 11) + "..." : entry.value}
                </li>
            ))}
        </ul>
    );
}

// Card de gráfico
function CardChart({ title, children, empty }) {
    return (
        <Paper elevation={3} sx={{
            minHeight: 380, // altura maior para gráficos
            minWidth: 260,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            p: 2
        }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>{title}</Typography>
            <Box sx={{
                flex: 1,
                width: '100%',
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {empty ? (
                    <Typography variant="body2" color="text.secondary">Sem dados</Typography>
                ) : children}
            </Box>
        </Paper>
    );
}

// Label da fatia da pizza (só o percentual, fonte pequena)
const renderPieLabel = ({ percent }) =>
    percent > 0.06 ? `${(percent * 100).toFixed(0)}%` : ""; // só mostra se for maior que 6%

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
        <Box sx={{
            width: '100vw',
            minHeight: '100vh',
            p: 0,
            m: 0,
            overflowX: 'hidden',
            background: '#fff'
        }}>
            <Typography variant="h5" gutterBottom sx={{ ml: 4, mt: 2 }}>Painel de Relatórios</Typography>
            {/* Cards de resumo */}
            <Grid container spacing={2} mb={1} sx={{ pl: 3, pr: 3 }}>
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
            <Grid container spacing={2} mb={1} sx={{ pl: 3, pr: 3 }}>
                <Grid item xs={12} md={4} lg={4} xl={4}>
                    <CardChart title="Atendimentos por Usuário" empty={!byUser?.length}>
                        {byUser?.length > 0 &&
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={byUser}>
                                    <XAxis dataKey="atendente" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#1976d2" />
                                </BarChart>
                            </ResponsiveContainer>
                        }
                    </CardChart>
                </Grid>
                <Grid item xs={12} md={4} lg={4} xl={4}>
                    <CardChart title="Atendimentos por Dia" empty={!byDay?.length}>
                        {byDay?.length > 0 &&
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={byDay}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="dia" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#d32f2f" />
                                </LineChart>
                            </ResponsiveContainer>
                        }
                    </CardChart>
                </Grid>
                <Grid item xs={12} md={4} lg={4} xl={4}>
                    <CardChart title="Evolução Mensal (Últimos 6 Meses)" empty={!byMonth?.length}>
                        {byMonth?.length > 0 &&
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={byMonth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#fbc02d" />
                                </LineChart>
                            </ResponsiveContainer>
                        }
                    </CardChart>
                </Grid>
            </Grid>

            {/* Linha 2 de gráficos */}
            <Grid container spacing={2} sx={{ pl: 3, pr: 3, pb: 2 }}>
                <Grid item xs={12} md={4} lg={4} xl={4}>
                    <CardChart title="Top Lojas" empty={!byStore?.length}>
                        {byStore?.length > 0 &&
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={byStore}
                                        dataKey="count"
                                        nameKey="loja"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={85}
                                        label={renderPieLabel}
                                        labelLine={false}
                                        fontSize={12}
                                    >
                                        {byStore.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconSize={12} content={<CustomLegend />} />
                                </PieChart>
                            </ResponsiveContainer>
                        }
                    </CardChart>
                </Grid>
                <Grid item xs={12} md={4} lg={4} xl={4}>
                    <CardChart title="Top Ocorrências" empty={!byOccurrence?.length}>
                        {byOccurrence?.length > 0 &&
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={byOccurrence}
                                        dataKey="count"
                                        nameKey="ocorrencia"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={85}
                                        label={renderPieLabel}
                                        labelLine={false}
                                        fontSize={12}
                                    >
                                        {byOccurrence.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconSize={12} content={<CustomLegend />} />
                                </PieChart>
                            </ResponsiveContainer>
                        }
                    </CardChart>
                </Grid>
                <Grid item xs={12} md={4} lg={4} xl={4}>
                    <CardChart title="Atendimentos por Setor" empty={!bySector?.length}>
                        {bySector?.length > 0 &&
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={bySector}>
                                    <XAxis dataKey="setor" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#388e3c" />
                                </BarChart>
                            </ResponsiveContainer>
                        }
                    </CardChart>
                </Grid>
            </Grid>
        </Box>
    );
}
