// frontend/src/components/ReportDashboard.js
import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper, CircularProgress } from "@mui/material";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";
import API_URL from "../config";

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend
);

// CORES fixas
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

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        const headers = { Authorization: 'Bearer ' + token };

        const fetchData = async (endpoint, defaultValue) => {
            try {
                const res = await fetch(`${API_URL}/api/reports/${endpoint}`, { headers });
                if (!res.ok) return defaultValue;
                return await res.json();
            } catch (err) {
                console.error(`Erro ao buscar ${endpoint}:`, err);
                return defaultValue;
            }
        };

        Promise.all([
            fetchData("summary", {}),
            fetchData("byUser", []),
            fetchData("byDay", []),
            fetchData("byStore", []),
            fetchData("byOccurrence", []),
            fetchData("bySector", []),
            fetchData("byMonth", [])
        ]).then(([sum, user, day, store, occ, sector, month]) => {
            setSummary(sum);
            setByUser(Array.isArray(user) ? user : []);
            setByDay(
                Array.isArray(day) ? day.map(r => {
                    const [y, m, d] = r.dia.split('-');
                    return { ...r, dia: `${d}/${m}` };
                }) : []
            );
            setByStore(Array.isArray(store) ? store : []);
            setByOccurrence(Array.isArray(occ) ? occ : []);
            setBySector(Array.isArray(sector) ? sector : []);
            setByMonth(
                Array.isArray(month) ? month.map(r => {
                    const [y, m] = r.mes.split('-');
                    return { ...r, mes: `${m}/${y}` };
                }) : []
            );
            setLoading(false);
        });
    }, [token]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Dados para Chart.js
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
            borderColor: COLORS[0],
            tension: 0.3,
            pointBackgroundColor: COLORS[0]
        }]
    };
    const lineMonth = {
        labels: byMonth.map(i => i.mes),
        datasets: [{
            label: "Atendimentos",
            data: byMonth.map(i => i.count),
            fill: false,
            borderColor: COLORS[3],
            tension: 0.3,
            pointBackgroundColor: COLORS[3]
        }]
    };
    const pieStore = {
        labels: byStore.map(i => i.loja.length > 15 ? i.loja.slice(0, 14) + "…" : i.loja),
        datasets: [{ data: byStore.map(i => i.count), backgroundColor: COLORS, borderWidth: 1 }]
    };
    const pieOccurrence = {
        labels: byOccurrence.map(i => i.ocorrencia.length > 15 ? i.ocorrencia.slice(0, 14) + "…" : i.ocorrencia),
        datasets: [{ data: byOccurrence.map(i => i.count), backgroundColor: COLORS, borderWidth: 1 }]
    };

    return (
        <Box sx={{
            width: "100%",
            p: 2,
            background: "#fff"
        }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>Painel de Relatórios</Typography>

            {/* Resumo */}
            <Grid container spacing={2} mb={2}>
                {[
                    { title: "Tempo Médio", value: summary.averageTime ?? "-" },
                    { title: "Total Atend.", value: summary.total ?? 0 },
                    { title: "Top Atendente", value: summary.topAttendant ? `${summary.topAttendant} (${summary.topCount})` : "-" }
                ].map((c, i) => (
                    <Grid key={i} item xs={12} sm={6} md={4} lg={2.4}>
                        <Paper elevation={3} sx={{ p: 2 }}>
                            <Typography variant="subtitle1">{c.title}</Typography>
                            <Typography variant="h4">{c.value}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Gráficos */}
            <Grid container spacing={2} mb={2}>
                <Grid item xs={12} md={4}>
                    <CardChart title="Atendimentos por Usuário" empty={!byUser.length}>
                        <Bar data={barUser} options={{ responsive: true, plugins: { legend: { display: false } } }} height={250} />
                    </CardChart>
                </Grid>
                <Grid item xs={12} md={4}>
                    <CardChart title="Atendimentos por Dia" empty={!byDay.length}>
                        <Line data={lineDay} options={{ responsive: true, plugins: { legend: { display: false } } }} height={250} />
                    </CardChart>
                </Grid>
                <Grid item xs={12} md={4}>
                    <CardChart title="Evolução Mensal" empty={!byMonth.length}>
                        <Line data={lineMonth} options={{ responsive: true, plugins: { legend: { display: false } } }} height={250} />
                    </CardChart>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <CardChart title="Top Lojas" empty={!byStore.length}>
                        <Pie data={pieStore} options={{
                            responsive: true,
                            plugins: { legend: { position: "bottom", labels: { font: { size: 12 } } } }
                        }} height={250} />
                    </CardChart>
                </Grid>
                <Grid item xs={12} md={4}>
                    <CardChart title="Top Ocorrências" empty={!byOccurrence.length}>
                        <Pie data={pieOccurrence} options={{
                            responsive: true,
                            plugins: { legend: { position: "bottom", labels: { font: { size: 12 } } } }
                        }} height={250} />
                    </CardChart>
                </Grid>
                <Grid item xs={12} md={4}>
                    <CardChart title="Atendimentos por Setor" empty={!bySector.length}>
                        <Bar data={barSector} options={{ responsive: true, plugins: { legend: { display: false } } }} height={250} />
                    </CardChart>
                </Grid>
            </Grid>
        </Box>
    );
}
