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

export default function CategoryManagement({ token }) {
    const types = ['lojas', 'contatos', 'ocorrencias'];
    const [tab, setTab] = useState('lojas');
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState({ old: '', value: '' });

    // Busca categorias e mapeia cada item para ter id único
    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/categories`, {
                headers: { Authorization: 'Bearer ' + token },
            });
            const obj = await res.json();
            const items = obj[tab] || [];

            const rows = items.map(item => {
                // para contatos, item é objeto { value, active }
                if (tab === 'contatos') {
                    return {
                        id: item.value,
                        value: item.value,
                        active: item.active,
                    };
                }
                // para lojas e ocorrencias, item é string
                return {
                    id: item,
                    value: item,
                };
            });

            setData(rows);
        } catch (err) {
            console.error('Erro ao buscar categorias:', err);
        }
    };

    useEffect(fetchData, [tab]);

    // Adicionar novo
    const handleAdd = async () => {
        try {
            await fetch(`${API_URL}/api/categories/${tab}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
                body: JSON.stringify({ value: current.value }),
            });
            setOpen(false);
            fetchData();
        } catch (err) {
            console.error('Erro ao adicionar item:', err);
        }
    };

    // Salvar edição (rename)
    const handleSave = async () => {
        try {
            await fetch(
                `${API_URL}/api/categories/${tab}/${encodeURIComponent(current.old)}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                    body: JSON.stringify({ value: current.value }),
                }
            );
            setOpen(false);
            fetchData();
        } catch (err) {
            console.error('Erro ao salvar edição:', err);
        }
    };

    // Excluir ou inativar
    const handleDelete = async value => {
        try {
            if (tab === 'contatos') {
                // inativa contato
                await fetch(
                    `${API_URL}/api/categories/contatos/${encodeURIComponent(
                        value
                    )}/inativar`,
                    {
                        method: 'PUT',
                        headers: { Authorization: 'Bearer ' + token },
                    }
                );
            } else {
                // deleta loja ou ocorrência
                await fetch(`${API_URL}/api/categories/${tab}/${encodeURIComponent(value)}`, {
                    method: 'DELETE',
                    headers: { Authorization: 'Bearer ' + token },
                });
            }
            fetchData();
        } catch (err) {
            console.error('Erro ao excluir/inativar:', err);
        }
    };

    const columns = [
        {
            field: 'value',
            headerName: 'Valor',
            flex: 1,
        },
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
                    setData([]);
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
                    // aqui garantimos que getRowId é uma função
                    getRowId={row => row.id}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 25, 100]}
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
                        onChange={e => setCurrent(c => ({ ...c, value: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button
                        onClick={() => {
                            current.old ? handleSave() : handleAdd();
                        }}
                    >
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
