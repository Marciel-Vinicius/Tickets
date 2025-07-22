// frontend/src/components/CategoryManagement.js
import React, { useState, useEffect } from 'react'
import API_URL from '../config'
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
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

export default function CategoryManagement({ token }) {
    const types = ['lojas', 'contatos', 'ocorrencias']
    const [tab, setTab] = useState('lojas')
    const [data, setData] = useState([])
    const [open, setOpen] = useState(false)
    const [current, setCurrent] = useState({ old: '', value: '' })

    // Busca e normaliza: sempre objetos { value, [active] }
    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/categories`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const obj = await res.json()
            const items = Array.isArray(obj[tab]) ? obj[tab] : []
            setData(items.map(item => ({
                value: item.value,
                active: item.active
            })))
        } catch (err) {
            console.error('Erro ao buscar categorias:', err)
            setData([])
        }
    }

    useEffect(fetchData, [tab])

    // Cria novo
    const handleAdd = async () => {
        await fetch(`${API_URL}/api/categories/${tab}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ value: current.value }),
        })
        setOpen(false)
        fetchData()
    }

    // Renomeia
    const handleSave = async () => {
        await fetch(
            `${API_URL}/api/categories/${tab}/${encodeURIComponent(current.old)}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ value: current.value }),
            }
        )
        setOpen(false)
        fetchData()
    }

    // Deleta / inativa
    const handleDelete = async value => {
        if (tab === 'contatos') {
            await fetch(
                `${API_URL}/api/categories/contatos/${encodeURIComponent(value)}/inativar`,
                { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
            )
        } else {
            await fetch(
                `${API_URL}/api/categories/${tab}/${encodeURIComponent(value)}`,
                { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
            )
        }
        fetchData()
    }

    return (
        <Box p={2}>
            <Typography variant="h5" gutterBottom>
                Gerenciar Categorias
            </Typography>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                <Tab label="LOJAS" value="lojas" />
                <Tab label="CONTATOS" value="contatos" />
                <Tab label="OCORRÊNCIAS" value="ocorrencias" />
            </Tabs>

            <Box my={2}>
                <Button
                    variant="contained"
                    onClick={() => {
                        setCurrent({ old: '', value: '' })
                        setOpen(true)
                    }}
                >
                    Adicionar
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Valor</TableCell>
                            <TableCell align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map(item => (
                            <TableRow key={item.value}>
                                <TableCell>{item.value}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setCurrent({ old: item.value, value: item.value })
                                            setOpen(true)
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(item.value)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

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
                        onChange={e =>
                            setCurrent(c => ({ ...c, value: e.target.value }))
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={current.old ? handleSave : handleAdd}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
