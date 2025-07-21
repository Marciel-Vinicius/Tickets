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
    IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

export default function CategoryManagement({ token }) {
    // os três tipos de categoria
    const types = ['lojas', 'contatos', 'ocorrencias'];
    const [tab, setTab] = useState('lojas');
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState({ old: '', value: '' });

    // 1. Busca categorias do backend
    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/categories`, {
                headers: { Authorization: `Bearer ${token}` }
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

    // 2. Criação ou edição de categoria
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
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            setOpen(false);
            setCurrent({ old: '', value: '' });
            fetchData();
        } catch (err) {
            console.error('Erro ao salvar categoria:', err);
        }
    };

    // 3. Inativar contato
    const handleInactivate = async (value) => {
        if (!window.confirm('Confirma inativar este contato?')) return;
        try {
            const res = await fetch(
                `${API_URL}/api/categories/contatos/${encodeURIComponent(value)}/inativar`,
                {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (!res.ok) throw new Error(`Status ${res.status}`);
            fetchData();
        } catch (err) {
            console.error('Erro ao inativar contato:', err);
        }
    };

    // 4. Excluir loja/ocorrência
    const handleDelete = async (value) => {
        if (!window.confirm('Confirma exclusão?')) return;
        try {
            const res = await fetch(
                `${API_URL}/api/categories/${tab}/${encodeURIComponent(value)}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (!res.ok) throw new Error(`Status ${res.status}`);
            fetchData();
        } catch (err) {
            console.error('Erro ao deletar categoria:', err);
        }
    };

    // 5. Abre diálogo de criar/editar
    const openModal = (mode, row) => {
        if (mode === 'edit') {
            setCurrent({ old: row.value, value: row.value });
        } else {
            setCurrent({ old: '', value: '' });
        }
        setOpen(true);
    };

    // 6. Definição das colunas, usando renderCell para ter controle total dos onClick
    const columns = [
        { field: 'value', headerName: 'Valor', flex: 1 },
        {
            field: 'actions',
            headerName: 'Ações',
            sortable: false,
            width: 120,
            renderCell: (params) => {
                const v = params.row.value;
                return (
                    <>
                        <IconButton
                            size="small"
                            onClick={() => openModal('edit', params.row)}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        {tab === 'contatos' ? (
                            <IconButton
                                size="small"
                                onClick={() => handleInactivate(v)}
                            >
                                <RemoveCircleOutlineIcon fontSize="small" />
                            </IconButton>
                        ) : (
                            <IconButton
                                size="small"
                                onClick={() => handleDelete(v)}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </>
                );
            }
        }
    ];

    // 7. Mapeia os dados garantindo sempre um `id` único
    const rows = data.reduce((acc, item) => {
        if (!item) return acc;
        // contatos vêm como objeto { value, active }
        if (typeof item === 'object' && item.value) {
            acc.push({ id: item.value, value: item.value, active: item.active });
        }
        // lojas e ocorrências vêm como string
        else if (typeof item === 'string' && item.trim()) {
            acc.push({ id: item, value: item });
        }
        return acc;
    }, []);

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Typography variant="h5" gutterBottom>
                Gerenciar Categorias
            </Typography>

            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                textColor="inherit"
                indicatorColor="primary"
            >
                <Tab label="LOJAS" value="lojas" />
                <Tab label="CONTATOS" value="contatos" />
                <Tab label="OCORRÊNCIAS" value="ocorrencias" />
            </Tabs>

            <Button
                variant="contained"
                sx={{ my: 2 }}
                onClick={() => openModal('add', null)}
            >
                Adicionar
            </Button>

            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row.id}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50, 100]}
                disableSelectionOnClick
                autoHeight
            />

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>
                    {current.old ? 'Editar valor' : 'Novo valor'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Valor"
                        type="text"
                        fullWidth
                        value={current.value}
                        onChange={(e) =>
                            setCurrent((prev) => ({ ...prev, value: e.target.value }))
                        }
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
