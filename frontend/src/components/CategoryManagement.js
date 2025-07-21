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
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

export default function CategoryManagement({ token }) {
    const [tab, setTab] = useState('lojas');
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState({ old: '', value: '' });

    // Fetch das três listas
    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/categories`, {
                headers: { Authorization: 'Bearer ' + token }
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const obj = await res.json();
            setData(Array.isArray(obj[tab]) ? obj[tab] : []);
        } catch (err) {
            console.error('Erro ao buscar categorias:', err);
            setData([]);
        }
    };

    useEffect(fetchData, [tab]);

    // Criar / Renomear
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
            console.error('Erro ao salvar categoria:', err);
        }
    };

    // Inativar contato
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
            console.error('Erro ao inativar contato:', err);
        }
    };

    // Deletar loja/ocorrência
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
            console.error('Erro ao deletar item:', err);
        }
    };

    // Abre modal para criar/editar
    const openModal = (mode, row) => {
        if (mode === 'edit') {
            setCurrent({ old: row.value, value: row.value });
        } else {
            setCurrent({ old: '', value: '' });
        }
        setOpen(true);
    };

    // Definição das colunas
    const columns = [
        { field: 'value', headerName: 'Valor', flex: 1 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            getActions: params => {
                const v = params.row.value;
                return [
                    <GridActionsCellItem
                        key="edit"
                        icon={<EditIcon />}
                        label="Editar"
                        onClick={() => openModal('edit', params.row)}
                        showInMenu={false}
                    />,
                    tab === 'contatos' ? (
                        <GridActionsCellItem
                            key="inactivate"
                            icon={<RemoveCircleOutlineIcon />}
                            label="Inativar"
                            onClick={() => handleInactivate(v)}
                            showInMenu={false}
                        />
                    ) : (
                        <GridActionsCellItem
                            key="delete"
                            icon={<DeleteIcon />}
                            label="Deletar"
                            onClick={() => handleDelete(v)}
                            showInMenu={false}
                        />
                    )
                ];
            }
        }
    ];

    // Mapeia e filtra linhas garantindo id único
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
