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
    const [tab, setTab] = useState('lojas');
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState({ old: '', value: '' });

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/categories`, {
                headers: { Authorization: 'Bearer ' + token }
            });
            if (!res.ok) throw new Error(res.status);
            const obj = await res.json();
            setData(Array.isArray(obj[tab]) ? obj[tab] : []);
        } catch (err) {
            console.error(err);
            setData([]);
        }
    };
    useEffect(fetchData, [tab]);

    const handleSave = async () => {
        const isEdit = Boolean(current.old);
        const url = `${API_URL}/api/categories/${tab}`;
        const method = isEdit ? 'PUT' : 'POST';
        const body = isEdit
            ? { old: current.old, value: current.value }
            : { value: current.value };
        try {
            await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token
                },
                body: JSON.stringify(body)
            });
            setOpen(false);
            setCurrent({ old: '', value: '' });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleInactivate = async value => {
        if (!window.confirm('Confirma inativar este contato?')) return;
        try {
            await fetch(
                `${API_URL}/api/categories/contatos/${encodeURIComponent(
                    value
                )}/inativar`,
                {
                    method: 'PUT',
                    headers: { Authorization: 'Bearer ' + token }
                }
            );
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async value => {
        if (!window.confirm('Confirma exclusão?')) return;
        try {
            await fetch(
                `${API_URL}/api/categories/${tab}/${encodeURIComponent(value)}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: 'Bearer ' + token }
                }
            );
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const openModal = (mode, row) => {
        if (mode === 'edit') {
            setCurrent({ old: row.value, value: row.value });
        } else {
            setCurrent({ old: '', value: '' });
        }
        setOpen(true);
    };

    const columns = [
        { field: 'value', headerName: 'Valor', flex: 1 },
        {
            field: 'actions',
            headerName: 'Ações',
            sortable: false,
            width: 140,
            renderCell: params => {
                const v = params.row.value;
                return (
                    <>
                        <IconButton
                            onClick={() => openModal('edit', params.row)}
                            size="small"
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        {tab === 'contatos' ? (
                            <IconButton
                                onClick={() => handleInactivate(v)}
                                size="small"
                            >
                                <RemoveCircleOutlineIcon fontSize="small" />
                            </IconButton>
                        ) : (
                            <IconButton
                                onClick={() => handleDelete(v)}
                                size="small"
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </>
                );
            }
        }
    ];

    const rows = data
        .map(item => {
            if (item && typeof item === 'object' && item.value != null) {
                return { id: item.value, value: item.value, active: item.active };
            }
            if (typeof item === 'string' && item.trim() !== '') {
                return { id: item, value: item };
            }
            return null;
        })
        .filter(Boolean);

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
                getRowId={row => row.id}
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
                        margin="dense"
                        label="Valor"
                        type="text"
                        value={current.value}
                        onChange={e =>
                            setCurrent(prev => ({ ...prev, value: e.target.value }))
                        }
                        fullWidth
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
