// frontend/src/components/CategoryManagement.js
import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import {
    Box, Typography, Tabs, Tab,
    Button, Dialog, DialogTitle,
    DialogContent, DialogActions,
    TextField
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CategoryManagement({ token }) {
    const [tab, setTab] = useState('lojas');
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState({ old: '', value: '' });

    // Busca dados das três listas
    const fetchData = () => {
        fetch(`${API_URL}/api/categories`, {
            headers: { Authorization: 'Bearer ' + token }
        })
            .then(r => r.json())
            .then(obj => setData(obj[tab] || []))
            .catch(console.error);
    };

    useEffect(fetchData, [tab]);

    // Cria ou renomeia
    const handleSave = () => {
        const isEdit = Boolean(current.old);
        const url = `${API_URL}/api/categories/${tab}`;
        const method = isEdit ? 'PUT' : 'POST';
        const body = isEdit
            ? { old: current.old, value: current.value }
            : { value: current.value };

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify(body)
        })
            .then(() => {
                setOpen(false);
                setCurrent({ old: '', value: '' });
                fetchData();
            })
            .catch(console.error);
    };

    // Inativa apenas contatos
    const handleInactivate = value => {
        if (!window.confirm('Confirma inativar este contato?')) return;
        fetch(
            `${API_URL}/api/categories/contatos/${encodeURIComponent(
                value
            )}/inativar`,
            {
                method: 'PUT',
                headers: { Authorization: 'Bearer ' + token }
            }
        )
            .then(fetchData)
            .catch(console.error);
    };

    // Abre modal de criação/edição
    const openModal = (mode, row) => {
        if (mode === 'edit') {
            setCurrent({ old: row.value, value: row.value });
        } else {
            setCurrent({ old: '', value: '' });
        }
        setOpen(true);
    };

    // Colunas do DataGrid
    const columns = [
        {
            field: 'value',
            headerName: 'Valor',
            flex: 1
        },
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
                    />,
                    tab === 'contatos' ? (
                        <GridActionsCellItem
                            key="inactivate"
                            icon={
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleInactivate(v)}
                                >
                                    Inativar
                                </Button>
                            }
                            label="Inativar"
                        />
                    ) : (
                        <GridActionsCellItem
                            key="delete"
                            icon={<DeleteIcon />}
                            label="Deletar"
                            onClick={() => {
                                if (window.confirm('Confirma exclusão?')) {
                                    fetch(
                                        `${API_URL}/api/categories/${tab}/${encodeURIComponent(
                                            v
                                        )}`,
                                        {
                                            method: 'DELETE',
                                            headers: { Authorization: 'Bearer ' + token }
                                        }
                                    ).then(fetchData);
                                }
                            }}
                        />
                    )
                ];
            }
        }
    ];

    // Mapeia cada row garantindo um id único
    const rows = Array.isArray(data)
        ? data.map(item => {
            if (typeof item === 'object') {
                // contatos vêm como { value, active }
                return { id: item.value, value: item.value, active: item.active };
            } else {
                // lojas e ocorrências vêm como string
                return { id: item, value: item };
            }
        })
        : [];

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
                            setCurrent(p => ({ ...p, value: e.target.value }))
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
