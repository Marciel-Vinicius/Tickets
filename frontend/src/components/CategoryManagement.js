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

export default function CategoryManagement({ token }) {
    const [tab, setTab] = useState('lojas');
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState({ oldValue: '', value: '' });

    // Busca categorias do servidor e normaliza em objetos { value, active? }
    const fetchData = () => {
        fetch(`${API_URL}/api/categories`, {
            headers: { Authorization: 'Bearer ' + token }
        })
            .then(r => r.json())
            .then(obj => {
                const list = obj[tab];
                // Se forem strings (lojas ou ocorrencias), converte em objetos
                if (list.length === 0 || typeof list[0] === 'string') {
                    setData(list.map(v => ({ value: v })));
                } else {
                    // contatos já vem como { value, active }
                    setData(list);
                }
            })
            .catch(console.error);
    };

    useEffect(fetchData, [tab]);

    const handleTabChange = (_, value) => setTab(value);
    const handleAdd = () => { setCurrent({ oldValue: '', value: '' }); setOpen(true); };
    const handleEdit = row => { setCurrent({ oldValue: row.value, value: row.value }); setOpen(true); };
    const handleClose = () => setOpen(false);

    // Salvar criação ou edição
    const handleSave = () => {
        const method = current.oldValue ? 'PUT' : 'POST';
        const path = current.oldValue ? `/${encodeURIComponent(current.oldValue)}` : '';
        fetch(`${API_URL}/api/categories/${tab}${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({ value: current.value })
        })
            .then(res => {
                if (!res.ok) throw new Error();
                fetchData();
                setOpen(false);
            })
            .catch(() => alert('Erro ao salvar'));
    };

    // Inativar contato
    const handleInativar = row => {
        fetch(
            `${API_URL}/api/categories/contatos/${encodeURIComponent(row.value)}/inativar`,
            { method: 'PUT', headers: { Authorization: 'Bearer ' + token } }
        )
            .then(res => {
                if (!res.ok) throw new Error();
                fetchData();
            })
            .catch(() => alert('Erro ao inativar contato'));
    };

    // Deletar loja ou ocorrência
    const handleDelete = row => {
        fetch(
            `${API_URL}/api/categories/${tab}/${encodeURIComponent(row.value)}`,
            { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } }
        )
            .then(res => {
                if (!res.ok) throw new Error();
                fetchData();
            })
            .catch(() => alert('Erro ao apagar'));
    };

    // Define colunas para cada aba
    const baseColumn = {
        field: 'value',
        headerName: tab === 'lojas' ? 'Loja' : tab === 'contatos' ? 'Contato' : 'Ocorrência',
        flex: 1
    };

    const actionColumn = {
        field: 'actions',
        headerName: 'Ações',
        flex: 0.5,
        sortable: false,
        renderCell: params => (
            <>
                <IconButton onClick={() => handleEdit(params.row)}>
                    <EditIcon />
                </IconButton>
                {tab === 'contatos' ? (
                    <IconButton onClick={() => handleInativar(params.row)}>
                        <DeleteIcon />
                    </IconButton>
                ) : (
                    <IconButton onClick={() => handleDelete(params.row)}>
                        <DeleteIcon />
                    </IconButton>
                )}
            </>
        )
    };

    const columns =
        tab === 'contatos'
            ? [
                baseColumn,
                { field: 'active', headerName: 'Ativo', width: 100 },
                actionColumn
            ]
            : [baseColumn, actionColumn];

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Gerenciar Categorias
            </Typography>

            <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Lojas" value="lojas" />
                <Tab label="Contatos" value="contatos" />
                <Tab label="Ocorrências" value="ocorrencias" />
            </Tabs>

            <Button variant="contained" onClick={handleAdd} sx={{ mb: 2 }}>
                Adicionar
            </Button>

            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    getRowId={row => row.value}        // Usa "value" como ID único
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                />
            </div>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    {current.oldValue ? 'Editar ' : 'Adicionar '}
                    {tab === 'lojas'
                        ? 'Loja'
                        : tab === 'contatos'
                            ? 'Contato'
                            : 'Ocorrência'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Valor"
                        value={current.value}
                        onChange={e =>
                            setCurrent(p => ({ ...p, value: e.target.value }))
                        }
                        fullWidth
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
