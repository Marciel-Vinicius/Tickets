// frontend/src/components/ReportDashboard.js
import React, { useEffect, useState } from "react";
import {
    Box, Typography, Grid, Paper, CircularProgress
} from "@mui/material";
import {
    Bar, Line, Pie
} from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend
} from "chart.js";
import API_URL from "../config";

ChartJS.register(
    BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend
);

const COLORS = [
    "#1976d2", "#d32f2f", "#388e3c", "#fbc02d", "#7b1fa2", "#0288d1", "#c2185b",
    "#ff9800", "#43a047", "#ba68c8", "#ff7043", "#00796b"
];

function CardChart({ title, children, empty }) {
    return (
        <Paper elevation={3} sx={{
            minHeight: 370,
            minWidth: 260,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            p: 2
        }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>{title}</Typography>
            <Box sx={{
                flex: 1,
                width: "100%",
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                {empty ? (
                    <Typography variant="body2" color="text.secondary">Sem dados</Typography>
                ) : children}
            </Box>
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

    const fetchAll = () => {
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
    };

    useEffect(() => {
        fetchAll();
    }, [token]);

    if (loading) return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
        </Box>
    );

    const barUser = {
        labels: byUser.map(i => i.atendente),
        datasets: [{ label: "Atendimentos", data: byUser.map(i => i.count), backgroundColor: COLORS }]
    };
    const barSector = {
        labels: bySector.map(i => i.setor),
        datasets: [{ label: "Atendimentos", data: bySector.map(i => i.count), backgroundColor: COLORS }]
    };
    const lineDay = {
        labels: byDay.map(i => i.dia),
        datasets: [{
            label: "Atendimentos",
            data: byDay.map(i => i.count),
            fill: false,
            borderColor: "#1976d2",
            tension: 0.3,
            pointBackgroundColor: "#1976d2"
        }]
    };
    const lineMonth = {
        labels: byMonth.map(i => i.mes),
        datasets: [{
            label: "Atendimentos",
            data: byMonth.map(i => i.count),
            fill: false,
            borderColor: "#fbc02d",
            tension: 0.3,
            pointBackgroundColor: "#fbc02d"
        }]
    };
    const pieStore = {
        labels: byStore.map(i => i.loja.length > 15 ? i.loja.slice(0, 14) + "..." : i.loja),
        datasets: [{ data: byStore.map(i => i.count), backgroundColor: COLORS, borderWidth: 1 }]
    };
    const pieOccurrence = {
        labels: byOccurrence.map(i => i.ocorrencia.length > 15 ? i.ocorrencia.slice(0, 14) + "..." : i.ocorrencia),
        datasets: [{ data: byOccurrence.map(i => i.count), backgroundColor: COLORS, borderWidth: 1 }]
    };

    return (
        <Box sx={{ width: "100vw", minHeight: "100vh", overflowX: "hidden", background: "#fff" }}>
            <Typography variant="h5" gutterBottom sx={{ ml: 4, mt: 2 }}>Painel de Relatórios</Typography>

            <Grid container spacing={2} mb={1} sx={{ pl: 3, pr: 3 }}>
                {[{ title: "Tempo Médio", value: summary?.averageTime || "-" },
                { title: "Total Atend.", value: summary?.total || 0 },
                { title: "Top Atendente", value: summary?.topAttendant ? `${summary.topAttendant} (${summary.topCount})` : "-" }
                ].map((c, i) => (
                    <Grid key={i} item xs={12} sm={6} md={4} lg={2.4}>
                        <Paper elevation={3} sx={{ p: 2, mb: 1 }}>
                            <Typography variant="subtitle1">{c.title}</Typography>
                            <Typography variant="h4">{c.value}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={2} mb={1} sx={{ pl: 3, pr: 3 }}>
                <Grid item xs={12} md={4}><CardChart title="Atendimentos por Usuário" empty={!byUser.length}><Bar data={barUser} options={{ responsive: true, plugins: { legend: { display: false } } }} /></CardChart></Grid>
                <Grid item xs={12} md={4}><CardChart title="Atendimentos por Dia" empty={!byDay.length}><Line data={lineDay} options={{ responsive: true, plugins: { legend: { display: false } } }} /></CardChart></Grid>
                <Grid item xs={12} md={4}><CardChart title="Evolução Mensal (Últimos 6 Meses)" empty={!byMonth.length}><Line data={lineMonth} options={{ responsive: true, plugins: { legend: { display: false } } }} /></CardChart></Grid>
            </Grid>

            <Grid container spacing={2} sx={{ pl: 3, pr: 3, pb: 2 }}>
                <Grid item xs={12} md={4}><CardChart title="Top Lojas" empty={!byStore.length}><Pie data={pieStore} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} /></CardChart></Grid>
                <Grid item xs={12} md={4}><CardChart title="Top Ocorrências" empty={!byOccurrence.length}><Pie data={pieOccurrence} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} /></CardChart></Grid>
                <Grid item xs={12} md={4}><CardChart title="Atendimentos por Setor" empty={!bySector.length}><Bar data={barSector} options={{ responsive: true, plugins: { legend: { display: false } } }} /></CardChart></Grid>
            </Grid>
        </Box>
    );
}
