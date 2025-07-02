// frontend/src/components/CategoryManagement.js
import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import {
    Box, Typography, Tabs, Tab,
    Button, Dialog, DialogTitle,
    DialogContent, DialogActions,
    TextField, IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CategoryManagement({ token }) {
    const [tab, setTab] = useState('lojas');
    const [data, setData] = useState({});
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState({ oldValue: '', value: '' });

    const fetchData = () => {
        fetch(`${API_URL}/api/categories`, {
            headers: { Authorization: 'Bearer ' + token }
        })
            .then(r => r.json())
            .then(setData)
            .catch(console.error);
    };

    useEffect(fetchData, []);

    const handleAdd = () => {
        setCurrent({ oldValue: '', value: '' });
        setOpen(true);
    };
    const handleEdit = v => {
        setCurrent({ oldValue: v, value: v });
        setOpen(true);
    };
    const handleInactivate = v => {
        if (!window.confirm('Confirma inativação?')) return;
        fetch(`${API_URL}/api/categories/${tab}/${encodeURIComponent(v)}/inactivate`, {
            method: 'PATCH',
            headers: { Authorization: 'Bearer ' + token }
        }).then(fetchData);
    };

    const handleSave = () => {
        const isEdit = Boolean(current.oldValue);
        const url = isEdit
            ? `${API_URL}/api/categories/${tab}/${encodeURIComponent(current.oldValue)}`
            : `${API_URL}/api/categories/${tab}`;
        const method = isEdit ? 'PUT' : 'POST';
        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({ value: current.value })
        })
            .then(() => {
                setOpen(false);
                fetchData();
            })
            .catch(console.error);
    };

    const columns = [
        { field: 'value', headerName: 'Valor', flex: 1, minWidth: 150 },
        {
            field: 'actions',
            headerName: 'Ações',
            flex: 0.5,
            sortable: false,
            renderCell: params => (
                <>
                    <IconButton onClick={() => handleEdit(params.row.value)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleInactivate(params.row.value)}>
                        <DeleteIcon color="warning" />
                    </IconButton>
                </>
            )
        }
    ];

    return (
        <Box>
            <Typography variant="h6">Categorias</Typography>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                <Tab label="Lojas" value="lojas" />
                <Tab label="Contatos" value="contatos" />
                <Tab label="Ocorrências" value="ocorrencias" />
            </Tabs>
            <Button variant="contained" onClick={handleAdd} sx={{ my: 1 }}>
                Adicionar
            </Button>
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={(data[tab] || []).map(v => ({ id: v, value: v }))}
                    columns={columns}
                    getRowId={row => row.id}
                />
            </div>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>
                    {current.oldValue ? 'Editar' : 'Adicionar'} {tab}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Valor"
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
