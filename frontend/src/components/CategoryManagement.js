// frontend/src/components/CategoryManagement.js
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
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

export default function CategoryManagement({ token }) {
    const types = ['lojas', 'contatos', 'ocorrencias'];
    const [tab, setTab] = useState('lojas');
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState({ old: '', value: '' });

    // 1) Busca categorias quando muda a aba
    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/categories`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const obj = await res.json();
            setData(Array.isArray(obj[tab]) ? obj[tab] : []);
        } catch (err) {
            console.error('Erro ao buscar categorias:', err);
            setData([]);
        }
    };
    useEffect(fetchData, [tab, token]);

    // 2) Abre modal de adicionar ou editar
    const handleAdd = () => {
        setCurrent({ old: '', value: '' });
        setOpen(true);
    };
    const handleEdit = (value) => {
        setCurrent({ old: value, value });
        setOpen(true);
    };

    // 3) Salva (POST ou PUT)
    const handleSave = async () => {
        try {
            const url = `${API_URL}/api/categories/${tab}`;
            const method = current.old ? 'PUT' : 'POST';
            const body = current.old
                ? { old: current.old, value: current.value }
                : { value: current.value };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            setOpen(false);
            fetchData();
        } catch (err) {
            console.error('Erro ao salvar categoria:', err);
        }
    };

    // 4) Inativa contato
    const handleInactivate = async (value) => {
        if (!window.confirm('Confirma inativar este contato?')) return;
        try {
            const res = await fetch(
                `${API_URL}/api/categories/contatos/${encodeURIComponent(
                    value
                )}/inativar`,
                {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) throw new Error(`Status ${res.status}`);
            fetchData();
        } catch (err) {
            console.error('Erro ao inativar contato:', err);
        }
    };

    // 5) Exclui loja ou ocorrência
    const handleDelete = async (value) => {
        if (!window.confirm('Confirma exclusão?')) return;
        try {
            const res = await fetch(
                `${API_URL}/api/categories/${tab}/${encodeURIComponent(value)}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) throw new Error(`Status ${res.status}`);
            fetchData();
        } catch (err) {
            console.error('Erro ao deletar categoria:', err);
        }
    };

    // 6) Colunas do DataGrid (agora renderizando ações dentro de um Box)
    const columns = [
        { field: 'value', headerName: 'Valor', flex: 1 },
        {
            field: 'actions',
            headerName: 'Ações',
            sortable: false,
            width: 120,
            renderCell: (params) => {
                const val = params.row.value;
                return (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                            size="small"
                            onClick={() => handleEdit(val)}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        {tab === 'contatos' ? (
                            <IconButton
                                size="small"
                                onClick={() => handleInactivate(val)}
                            >
                                <RemoveCircleOutlineIcon fontSize="small" />
                            </IconButton>
                        ) : (
                            <IconButton
                                size="small"
                                onClick={() => handleDelete(val)}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                );
            },
        },
    ];

    // 7) Prepara as linhas, garantindo sempre um `id` único
    const rows = data
        .map((item) => {
            if (typeof item === 'string') {
                return { id: item, value: item };
            } else if (item && item.value) {
                return { id: item.value, value: item.value, active: item.active };
            }
            return null;
        })
        .filter(Boolean);

    return (
        <Box sx={{ height: 500, width: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Gerenciar Categorias
            </Typography>
            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                textColor="inherit"
                indicatorColor="primary"
            >
                <Tab label="Lojas" value="lojas" />
                <Tab label="Contatos" value="contatos" />
                <Tab label="Ocorrências" value="ocorrencias" />
            </Tabs>

            <Box sx={{ my: 2 }}>
                <Button variant="contained" onClick={handleAdd}>
                    Adicionar
                </Button>
            </Box>

            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row.id}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 25]}
                autoHeight
                disableSelectionOnClick
            />

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>
                    {current.old ? 'Editar' : 'Adicionar'} {tab}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label="Valor"
                        fullWidth
                        value={current.value}
                        onChange={(e) =>
                            setCurrent((prev) => ({ ...prev, value: e.target.value }))
                        }
                        autoComplete="off"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
