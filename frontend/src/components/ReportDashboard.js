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
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import API_URL from "../config";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend
);

export default function ReportDashboard() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        averageTime: 0,
        total: 0,
        topUser: { atendente: "", count: 0 }
    });
    const [byUser, setByUser] = useState([]);
    const [byDay, setByDay] = useState([]);
    const [byStore, setByStore] = useState([]);
    const [byOccurrence, setByOccurrence] = useState([]);
    const [bySector, setBySector] = useState([]);
    const [byMonth, setByMonth] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [rawData, setRawData] = useState([]);

    const fetchReports = async () => {
        setLoading(true);
        const qs = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
        try {
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
        if (startDate && endDate) fetchReports();
    };

    const exportToCSV = () => {
        if (!rawData.length) return;
        const headers = [
            "ID",
            "Atendente",
            "Setor",
            "Dia",
            "Hora Início",
            "Hora Fim",
            "Loja",
            "Contato",
            "Ocorrência"
        ];
        const rows = rawData.map((item) => [
            item.id,
            item.atendente,
            item.setor,
            item.dia,
            item.hora_inicio || item.horaInicio,
            item.hora_fim || item.horaFim || "",
            item.loja,
            item.contato,
            item.ocorrencia
        ]);
        const csvContent = [
            headers.join(","),
            ...rows.map((r) => r.map((v) => `"${v}"`).join(","))
        ].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
        return (
            <Box textAlign="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={2}>
            <Typography variant="h5" gutterBottom>
                Relatórios
            </Typography>

            <Box display="flex" alignItems="center" mb={3}>
                <TextField
                    label="Data Início"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Data Fim"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
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
                {/* Resumo Geral */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1">
                            Tempo Médio: {summary.averageTime} min
                        </Typography>
                        <Typography variant="subtitle1">
                            Total de Atendimentos: {summary.total}
                        </Typography>
                        <Typography variant="subtitle1">
                            Top Atendente: {summary.topUser.atendente} ({summary.topUser.count})
                        </Typography>
                    </Paper>
                </Grid>

                {/* Gráficos */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1">Atendimentos por Usuário</Typography>
                        <Bar
                            data={{
                                labels: byUser.map((i) => i.atendente),
                                datasets: [{ label: "Atendimentos", data: byUser.map((i) => i.count) }]
                            }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1">Atendimentos por Dia</Typography>
                        <Line
                            data={{
                                labels: byDay.map((i) => i.dia),
                                datasets: [{ label: "Atendimentos", data: byDay.map((i) => i.count) }]
                            }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1">Atendimentos por Loja</Typography>
                        <Pie
                            data={{
                                labels: byStore.map((i) => i.loja),
                                datasets: [{ label: "Atendimentos", data: byStore.map((i) => i.count) }]
                            }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1">Atendimentos por Ocorrência</Typography>
                        <Bar
                            data={{
                                labels: byOccurrence.map((i) => i.ocorrencia),
                                datasets: [{ label: "Atendimentos", data: byOccurrence.map((i) => i.count) }]
                            }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1">Atendimentos por Setor</Typography>
                        <Bar
                            data={{
                                labels: bySector.map((i) => i.setor),
                                datasets: [{ label: "Atendimentos", data: bySector.map((i) => i.count) }]
                            }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1">Atendimentos por Mês</Typography>
                        <Line
                            data={{
                                labels: byMonth.map((i) => i.mes),
                                datasets: [{ label: "Atendimentos", data: byMonth.map((i) => i.count) }]
                            }}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
