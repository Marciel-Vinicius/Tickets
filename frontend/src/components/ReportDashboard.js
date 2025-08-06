// frontend/src/components/ReportDashboard.js
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    TextField,
    Button
} from "@mui/material";
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
import CardChart from "./CardChart";  // seu wrapper original
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

export default function ReportDashboard() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({});
    const [byUser, setByUser] = useState([]);
    const [byDay, setByDay] = useState([]);
    const [byStore, setByStore] = useState([]);
    const [byOccurrence, setByOccurrence] = useState([]);
    const [bySector, setBySector] = useState([]);
    const [byMonth, setByMonth] = useState([]);

    // **NOVA**: estados para filtro/export
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [rawData, setRawData] = useState([]);

    const fetchReports = async () => {
        setLoading(true);
        const qs = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
        try {
            // 1) summary e gráficos
            const [
                sumRes,
                userRes,
                dayRes,
                storeRes,
                occRes,
                secRes,
                monRes
            ] = await Promise.all([
                fetch(`${API_URL}/reports/summary${qs}`),
                fetch(`${API_URL}/reports/byUser${qs}`),
                fetch(`${API_URL}/reports/byDay${qs}`),
                fetch(`${API_URL}/reports/byStore${qs}`),
                fetch(`${API_URL}/reports/byOccurrence${qs}`),
                fetch(`${API_URL}/reports/bySector${qs}`),
                fetch(`${API_URL}/reports/byMonth${qs}`)
            ]);
            setSummary(await sumRes.json());
            setByUser(await userRes.json());
            setByDay(await dayRes.json());
            setByStore(await storeRes.json());
            setByOccurrence(await occRes.json());
            setBySector(await secRes.json());
            setByMonth(await monRes.json());

            // 2) dados brutos para exportar
            const rawRes = await fetch(`${API_URL}/atendimentos${qs}`);
            setRawData(await rawRes.json());
        } catch (err) {
            console.error("Erro ao carregar relatórios:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleFilter = () => {
        if (startDate && endDate) {
            fetchReports();
        }
    };

    // **NOVA**: exportar CSV
    const exportToCSV = () => {
        if (!rawData.length) return;
        const headers = [
            "ID", "Atendente", "Setor", "Dia", "Hora Início", "Hora Fim", "Loja", "Contato", "Ocorrência"
        ];
        const rows = rawData.map(i => [
            i.id, i.atendente, i.setor, i.dia,
            i.hora_inicio || i.horaInicio, i.hora_fim || i.horaFim || "",
            i.loja, i.contato, i.ocorrencia
        ]);
        const csv = [
            headers.join(","),
            ...rows.map(r => r.map(v => `"${v}"`).join(","))
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute(
            "download",
            `relatorio_${startDate || "all"}_${endDate || "all"}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <Box mt={5} textAlign="center"><CircularProgress /></Box>;
    }

    return (
        <Box p={2}>
            <Typography variant="h5" gutterBottom>Painel de Relatórios</Typography>

            {/* ==== FILTRO E EXPORTAÇÃO ==== */}
            <Box display="flex" alignItems="center" mb={3}>
                <TextField
                    label="Data Início"
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Data Fim"
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ ml: 2 }}
                />
                <Button variant="contained" onClick={handleFilter} sx={{ ml: 2 }}>
                    Filtrar
                </Button>
                <Button variant="outlined" onClick={exportToCSV} sx={{ ml: 2 }}>
                    Exportar Excel
                </Button>
            </Box>

            <Grid container spacing={2}>
                {/* cards de resumo */}
                <Grid item xs={12} md={4}>
                    <CardChart title="Tempo Médio" empty={false}>
                        <Typography variant="h4">{summary.averageTime} min</Typography>
                    </CardChart>
                </Grid>
                <Grid item xs={12} md={4}>
                    <CardChart title="Total Atend." empty={false}>
                        <Typography variant="h4">{summary.total}</Typography>
                    </CardChart>
                </Grid>
                <Grid item xs={12} md={4}>
                    <CardChart title="Top Atendente" empty={!summary.topUser?.atendente}>
                        {summary.topUser?.atendente || "-"} ({summary.topUser?.count || 0})
                    </CardChart>
                </Grid>

                {/* seus gráficos originais, só alimentados pelos estados novos */}
                <Grid item xs={12} md={6} lg={4}>
                    <CardChart title="Atendimentos por Usuário" empty={!byUser.length}>
                        {byUser.length > 0 && (
                            <Bar
                                data={{
                                    labels: byUser.map(i => i.atendente),
                                    datasets: [{ label: "Qtd", data: byUser.map(i => i.count) }]
                                }}
                                options={{ responsive: true, plugins: { legend: { display: false } } }}
                                height={250}
                            />
                        )}
                    </CardChart>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                    <CardChart title="Atendimentos por Dia" empty={!byDay.length}>
                        {byDay.length > 0 && (
                            <Line
                                data={{
                                    labels: byDay.map(i => i.dia),
                                    datasets: [{ label: "Qtd", data: byDay.map(i => i.count) }]
                                }}
                                options={{ responsive: true, plugins: { legend: { display: false } } }}
                                height={250}
                            />
                        )}
                    </CardChart>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                    <CardChart title="Evolução Mensal (Últimos 6 Meses)" empty={!byMonth.length}>
                        {byMonth.length > 0 && (
                            <Line
                                data={{
                                    labels: byMonth.map(i => i.mes),
                                    datasets: [{ label: "Qtd", data: byMonth.map(i => i.count) }]
                                }}
                                options={{ responsive: true, plugins: { legend: { display: false } } }}
                                height={250}
                            />
                        )}
                    </CardChart>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                    <CardChart title="Top Lojas" empty={!byStore.length}>
                        {byStore.length > 0 && (
                            <Pie
                                data={{
                                    labels: byStore.map(i => i.loja),
                                    datasets: [{ label: "Qtd", data: byStore.map(i => i.count) }]
                                }}
                                options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
                                height={250}
                            />
                        )}
                    </CardChart>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                    <CardChart title="Top Ocorrências" empty={!byOccurrence.length}>
                        {byOccurrence.length > 0 && (
                            <Pie
                                data={{
                                    labels: byOccurrence.map(i => i.ocorrencia),
                                    datasets: [{ label: "Qtd", data: byOccurrence.map(i => i.count) }]
                                }}
                                options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
                                height={250}
                            />
                        )}
                    </CardChart>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                    <CardChart title="Atendimentos por Setor" empty={!bySector.length}>
                        {bySector.length > 0 && (
                            <Bar
                                data={{
                                    labels: bySector.map(i => i.setor),
                                    datasets: [{ label: "Qtd", data: bySector.map(i => i.count) }]
                                }}
                                options={{ responsive: true, plugins: { legend: { display: false } } }}
                                height={250}
                            />
                        )}
                    </CardChart>
                </Grid>
            </Grid>
        </Box>
    );
}
//teste