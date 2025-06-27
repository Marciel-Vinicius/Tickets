import React, { useState, useEffect } from 'react';
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
        fetch(`http://localhost:3001/api/categories`, {
            headers: { Authorization: 'Bearer ' + token }
        })
            .then(res => res.json())
            .then(obj => setData(obj[tab]))
            .catch(console.error);
    };

    useEffect(fetchData, [tab]);

    const handleChangeTab = (_, newVal) => setTab(newVal);

    const handleAdd = () => {
        setCurrent({ oldValue: '', value: '' });
        setOpen(true);
    };
    const handleEdit = val => {
        setCurrent({ oldValue: val, value: val });
        setOpen(true);
    };
    const handleDelete = val => {
        if (!window.confirm('Confirma exclusão?')) return;
        fetch(`http://localhost:3001/api/categories/${tab}/${encodeURIComponent(val)}`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + token }
        }).then(fetchData);
    };

    const handleSave = () => {
        const url = current.oldValue
            ? `http://localhost:3001/api/categories/${tab}/${encodeURIComponent(current.oldValue)}`
            : `http://localhost:3001/api/categories/${tab}`;
        const method = current.oldValue ? 'PUT' : 'POST';
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
            flex: 0.5,
            sortable: false,
            renderCell: params => (
                <>
                    <IconButton onClick={() => handleEdit(params.row.value)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.value)}>
                        <DeleteIcon color="error" />
                    </IconButton>
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
                    rows={data.map(v => ({ id: v, value: v }))}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                />
            </div>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>
                    {current.oldValue ? 'Editar' : 'Adicionar'}{' '}
                    {tab.charAt(0).toUpperCase() + tab.slice(1, -1)}
                </DialogTitle>
                <DialogContent sx={{ mt: 1 }}>
                    <TextField
                        label="Valor"
                        value={current.value}
                        onChange={e => setCurrent(prev => ({ ...prev, value: e.target.value }))}
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
