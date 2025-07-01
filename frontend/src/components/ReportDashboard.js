// frontend/src/components/ReportDashboard.js
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress
} from '@mui/material';
import API_URL from '../config';

export default function ReportDashboard({ token }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/reports/summary`, {
            headers: { Authorization: 'Bearer ' + token }
        })
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [token]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Painel de Relatórios
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1">Tempo Médio</Typography>
                            <Typography variant="h4">{data.averageTime}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1">Total de Atendimentos</Typography>
                            <Typography variant="h4">{data.total}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1">Mais Atendeu</Typography>
                            <Typography variant="h4">{data.topAttendant}</Typography>
                            <Typography variant="body2">
                                ({data.topCount} atendimentos)
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
