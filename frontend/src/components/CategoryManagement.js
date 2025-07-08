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
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState({ oldValue: '', value: '' });

    const fetchData = () => {
        fetch(`${API_URL}/api/categories`, {
            headers: { Authorization: 'Bearer ' + token }
        })
            .then(r => r.json())
            .then(obj => setData(obj[tab]))
            .catch(console.error);
    };

    useEffect(fetchData, [tab]);

    const handleChangeTab = (_, newVal) => setTab(newVal);
    const handleAdd = () => {
        setCurrent({ oldValue: '', value: '' });
        setOpen(true);
    };
    const handleEdit = v => {
        setCurrent({ oldValue: v, value: v });
        setOpen(true);
    };
    const handleDelete = v => {
        if (!window.confirm('Confirma exclusão?')) return;
        fetch(
            `${API_URL}/api/categories/${tab}/${encodeURIComponent(v)}`,
            {
                method: 'DELETE',
                headers: { Authorization: 'Bearer ' + token }
            }
        ).then(fetchData);
    };
    const handleInactivate = v => {
        if (!window.confirm('Confirma inativar este contato?')) return;
        fetch(
            `${API_URL}/api/categories/contatos/${encodeURIComponent(v)}/inativar`,
            {
                method: 'PUT',
                headers: { Authorization: 'Bearer ' + token }
            }
        )
            .then(fetchData)
            .catch(console.error);
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
        }).then(() => {
            setOpen(false);
            fetchData();
        });
    };

    const columns = [
        { field: 'value', headerName: 'Valor', flex: 1 },
        {
            field: 'actions',
            headerName: 'Ações',
            flex: tab === 'contatos' ? 1 : 0.5,
            sortable: false,
            renderCell: params => (
                <>
                    <IconButton onClick={() => handleEdit(params.row.value)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.value)}>
                        <DeleteIcon color="error" />
                    </IconButton>
                    {tab === 'contatos' && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleInactivate(params.row.value)}
                            sx={{ ml: 1 }}
                        >
                            Inativar
                        </Button>
                    )}
                </>
            )
        }
    ];

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Gerenciar Categorias
            </Typography>
            <Tabs value={tab} onChange={handleChangeTab}>
                <Tab label="Lojas" value="lojas" />
                <Tab label="Contatos" value="contatos" />
                <Tab label="Ocorrências" value="ocorrencias" />
            </Tabs>

            <Box sx={{ mt: 2, mb: 2 }}>
                <Button variant="contained" onClick={handleAdd}>
                    Adicionar
                </Button>
            </Box>

            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={data.map(v => ({
                        // assume v is { value: string, active?: boolean }
                        id: v.value,
                        value: v.value
                    }))}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                />
            </div>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>
                    {current.oldValue ? 'Editar' : 'Adicionar'} {tab}
                </DialogTitle>
                <DialogContent sx={{ mt: 1 }}>
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
