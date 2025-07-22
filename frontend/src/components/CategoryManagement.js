import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CategoryManagement({ token }) {
    const types = ['lojas', 'contatos', 'ocorrencias'];
    const [tab, setTab] = useState('lojas');
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState({ old: '', value: '' });

    // Busca e normaliza: cada item vira { id: number, value: string, [active]: boolean }
    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/categories`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(res.statusText);
            const obj = await res.json();
            const items = Array.isArray(obj[tab]) ? obj[tab] : [];
            const rows = items.map((item, idx) => ({
                id: idx,               // índice garante número único
                value: item.value,     // string
                ...(item.active !== undefined && { active: item.active }),
            }));
            setData(rows);
        } catch (err) {
            console.error('Erro ao buscar categorias:', err);
            setData([]);
        }
    };

    useEffect(fetchData, [tab]);

    // Cria novo
    const handleAdd = async () => {
        try {
            await fetch(`${API_URL}/api/categories/${tab}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ value: current.value }),
            });
            setOpen(false);
            fetchData();
        } catch (err) {
            console.error('Erro ao adicionar:', err);
        }
    };

    // Edita (rename)
    const handleSave = async () => {
        try {
            await fetch(
                `${API_URL}/api/categories/${tab}/${encodeURIComponent(current.old)}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ value: current.value }),
                }
            );
            setOpen(false);
            fetchData();
        } catch (err) {
            console.error('Erro ao renomear:', err);
        }
    };

    // Exclui ou inativa
    const handleDelete = async (value) => {
        try {
            if (tab === 'contatos') {
                await fetch(
                    `${API_URL}/api/categories/contatos/${encodeURIComponent(
                        value
                    )}/inativar`,
                    { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await fetch(
                    `${API_URL}/api/categories/${tab}/${encodeURIComponent(value)}`,
                    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
                );
            }
            fetchData();
        } catch (err) {
            console.error('Erro ao excluir/inativar:', err);
        }
    };

    const columns = [
        { field: 'value', headerName: 'Valor', flex: 1 },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 120,
            sortable: false,
            renderCell: params => (
                <>
                    <IconButton
                        size="small"
                        onClick={() => {
                            setCurrent({ old: params.row.value, value: params.row.value });
                            setOpen(true);
                        }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => handleDelete(params.row.value)}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </>
            ),
        },
    ];

    return (
        <Box p={2}>
            <Typography variant="h5" gutterBottom>
                Gerenciar Categorias
            </Typography>

            <Tabs
                value={tab}
                onChange={(_, v) => {
                    setTab(v);
                    setData([]); // limpa antes de recarregar
                }}
            >
                <Tab label="LOJAS" value="lojas" />
                <Tab label="CONTATOS" value="contatos" />
                <Tab label="OCORRÊNCIAS" value="ocorrencias" />
            </Tabs>

            <Box mt={2} mb={2}>
                <Button
                    variant="contained"
                    onClick={() => {
                        setCurrent({ old: '', value: '' });
                        setOpen(true);
                    }}
                >
                    Adicionar
                </Button>
            </Box>

            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    disableSelectionOnClick
                />
            </div>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>
                    {current.old ? 'Editar' : 'Adicionar'}{' '}
                    {tab === 'ocorrencias' ? 'OCORRÊNCIAS' : tab.toUpperCase()}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Valor"
                        fullWidth
                        autoComplete="off"
                        value={current.value}
                        onChange={e =>
                            setCurrent(c => ({ ...c, value: e.target.value }))
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={() => (current.old ? handleSave() : handleAdd())}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
