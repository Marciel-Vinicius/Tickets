// frontend/src/components/CategoryManagement.js
import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import {
    Box, TextField, Button, Select, MenuItem,
    FormControl, InputLabel, IconButton, Stack, Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CategoryManagement({ token }) {
    const [type, setType] = useState('loja');
    const [list, setList] = useState([]);
    const [newName, setNewName] = useState('');

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const fetchList = () => {
        fetch(`${API_URL}/api/categories?type=${type}`, { headers })
            .then(r => r.json())
            .then(setList);
    };

    useEffect(fetchList, [type]);

    const handleAdd = () => {
        if (!newName) return;
        fetch(`${API_URL}/api/categories`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: newName, type })
        })
            .then(r => r.ok && fetchList())
            .finally(() => setNewName(''));
    };

    const handleDelete = id =>
        fetch(`${API_URL}/api/categories/${id}`, {
            method: 'DELETE',
            headers
        }).then(() => fetchList());

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                Gerenciar {type === 'loja' ? 'Lojas'
                    : type === 'contato' ? 'Contatos'
                        : 'Ocorrências'}
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tipo</InputLabel>
                <Select
                    value={type}
                    label="Tipo"
                    onChange={e => setType(e.target.value)}
                >
                    <MenuItem value="loja">Loja</MenuItem>
                    <MenuItem value="contato">Contato</MenuItem>
                    <MenuItem value="ocorrencia">Ocorrência</MenuItem>
                </Select>
            </FormControl>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    label="Novo nome"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                />
                <Button variant="contained" onClick={handleAdd}>
                    Adicionar
                </Button>
            </Stack>

            <Stack spacing={1}>
                {list.map(item => (
                    <Box
                        key={item.id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1
                        }}
                    >
                        <Typography>{item.name}</Typography>
                        <IconButton color="error" onClick={() => handleDelete(item.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
}
