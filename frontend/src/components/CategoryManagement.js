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
        fetch(`${API_URL}/api/categories/${tab}/${encodeURIComponent(v)}`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + token }
        }).then(fetchData);
    };

    const handleInactivate = id => {
        if (!window.confirm('Confirma inativar este contato?')) return;
        fetch(`${API_URL}/api/categories/contatos/${id}`, {
            method: 'PUT',
            headers: { Authorization: 'Bearer ' + token }
        })
            .then(fetchData)
            .catch(console.error);
    };

    const handleSave = () => {
        const method = current.oldValue ? 'PUT' : 'POST';
        const url = current.oldValue
            ? `${API_URL}/api/categories/${tab}/${encodeURIComponent(current.oldValue)}`
            : `${API_URL}/api/categories/${tab}`;
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
            sortable: false,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleEdit(params.row.value)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.value)}>
                        <DeleteIcon />
                    </IconButton>
                    {tab === 'contatos' && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleInactivate(params.row.id)}
                            startIcon={<RemoveCircleOutlineIcon />}
                        >
                            Inativar
                        </Button>
                    )}
                </>
            ),
        }
    ];

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Gerenciar Categorias
            </Typography>
            <Tabs value={tab} onChange={handleChangeTab}>
                {types.map(t => (
                    <Tab key={t} label={t.toUpperCase()} value={t} />
                ))}
            </Tabs>
            <Button onClick={handleAdd} variant="contained" sx={{ mt: 2 }}>
                Adicionar
            </Button>

            <Box mt={2} sx={{ height: 500 }}>
                <DataGrid
                    rows={data.map((row, i) => ({ id: row.id || i, ...row }))}
                    columns={columns}
                    pageSize={100}
                    rowsPerPageOptions={[100]}
                />
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>{current.oldValue ? 'Editar' : 'Adicionar'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        fullWidth
                        value={current.value}
                        onChange={e => setCurrent({ ...current, value: e.target.value })}
                        label="Valor"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
