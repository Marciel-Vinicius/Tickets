import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CircularProgress, Button, TextField
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts';
import API_URL from '../config';

export default function ReportDashboard({ token }) {
    const [summary, setSummary] = useState({});
    const [byUser, setByUser] = useState([]);
    const [byDay, setByDay] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado para data selecionada (default: hoje)
    const [reportDate, setReportDate] = useState(() => {
        const today = new Date();
        return today.toISOString().slice(0, 10); // yyyy-mm-dd
    });

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/api/reports/summary`, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()),
            fetch(`${API_URL}/api/reports/byUser`, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json()),
            fetch(`${API_URL}/api/reports/byDay`, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json())
        ]).then(([sum, u, d]) => {
            setSummary(sum);
            setByUser(u);
            // convertendo dia para "DD/MM"
            setByDay(d.map(r => {
                const [y, m, day] = r.dia.split('-');
                return { ...r, dia: `${day}/${m}` };
            }));
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [token]);

    // Função para baixar PDF
    const handleDownloadReport = () => {
        if (!reportDate) return;
        window.open(`${API_URL}/api/atendimentos/report/${reportDate}`, '_blank');
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Painel de Relatórios</Typography>

            <Box sx={{ my: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
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
                    color="primary"
                    onClick={handleDownloadReport}
                    disabled={!reportDate}
                >
                    Baixar Relatório PDF
                </Button>
            </Box>

            <Grid container spacing={3}>
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
            </Grid>
        </Box>
    );
}
