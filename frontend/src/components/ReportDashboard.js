import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CircularProgress
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts';
import API_URL from '../config';

export default function ReportDashboard({ token }) {
    const [summary, setSummary] = useState(null);
    const [byUser, setByUser] = useState([]);
    const [byDay, setByDay] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Painel de Relatórios</Typography>

            <Grid container spacing={3}>
                {[
                    { title: 'Tempo Médio', value: summary.averageTime },
                    { title: 'Total Atend.', value: summary.total },
                    { title: 'Top Atendente', value: `${summary.topAttendant} (${summary.topCount})` }
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
// Criar