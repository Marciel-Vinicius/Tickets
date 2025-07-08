// frontend/src/components/UserManagement.js
import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import {
    Box, Typography, IconButton,
    Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Button,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';

export default function UserManagement({ token }) {
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState({ username: '', sector: '', password: '' });

    const fetchUsers = () => {
        fetch(`${API_URL}/api/users`, {
            headers: { Authorization: 'Bearer ' + token }
        })
            .then(r => r.json())
            .then(setUsers)
            .catch(console.error);
    };
    useEffect(fetchUsers, []);

    const handleEdit = u => { setCurrent({ username: u.username, sector: u.sector, password: '' }); setOpen(true); };
    const handleClose = () => setOpen(false);
    const handleSave = () => {
        fetch(`${API_URL}/api/users/${current.username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({ sector: current.sector, password: current.password || undefined })
        })
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(() => { fetchUsers(); setOpen(false); })
            .catch(() => alert('Erro ao salvar usuário'));
    };

    const columns = [
        { field: 'username', headerName: 'Usuário', flex: 1 },
        { field: 'sector', headerName: 'Setor', flex: 1 },
        {
            field: 'actions',
            headerName: 'Ações',
            flex: 0.5,
            sortable: false,
            renderCell: params => (
                <IconButton onClick={() => handleEdit(params.row)}>
                    <EditIcon />
                </IconButton>
            )
        }
    ];

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Gerenciar Usuários</Typography>
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    getRowId={r => r.username}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                />
            </div>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogContent sx={{ display: 'grid', gap: 2, width: 300, mt: 1 }}>
                    <TextField label="Usuário" value={current.username} disabled fullWidth />
                    <FormControl fullWidth>
                        <InputLabel id="sector-label">Setor</InputLabel>
                        <Select
                            labelId="sector-label"
                            value={current.sector}
                            label="Setor"
                            onChange={e => setCurrent(p => ({ ...p, sector: e.target.value }))}
                        >
                            <MenuItem value="DEV">DEV</MenuItem>
                            <MenuItem value="SAF">SAF</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Nova senha"
                        type="password"
                        value={current.password}
                        onChange={e => setCurrent(p => ({ ...p, password: e.target.value }))}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">Salvar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}