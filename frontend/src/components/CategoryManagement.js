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
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'

export default function CategoryManagement({ token }) {
    const types = ['lojas', 'contatos', 'ocorrencias']
    const [tab, setTab] = useState('lojas')
    const [data, setData] = useState([])
    const [open, setOpen] = useState(false)
    const [current, setCurrent] = useState({ old: '', value: '' })

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/categories`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const obj = await res.json()
            const items = Array.isArray(obj[tab]) ? obj[tab] : []
            setData(
                items.map(item => ({
                    value: item.value,
                    active: item.active,
                }))
            )
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [tab])

    const handleAdd = async () => {
        try {
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
        } catch (err) {
            console.error(err)
        }
    }

    const handleSave = async () => {
        try {
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
        } catch (err) {
            console.error(err)
        }
    }

    const handleDeleteOrInactivate = async value => {
        try {
            if (tab === 'contatos') {
                // inativar contato
                await fetch(
                    `${API_URL}/api/categories/contatos/${encodeURIComponent(
                        value
                    )}/inativar`,
                    {
                        method: 'PUT',
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )
            } else {
                // delete normal para lojas e ocorrências
                await fetch(
                    `${API_URL}/api/categories/${tab}/${encodeURIComponent(value)}`,
                    {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )
            }
            fetchData()
        } catch (err) {
            console.error(err)
        }
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
                    Adicionar {tab === 'ocorrencias' ? 'OCORRÊNCIAS' : tab.toUpperCase()}
                </Button>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Valor</TableCell>
                            {tab === 'contatos' && <TableCell>Ativo?</TableCell>}
                            <TableCell align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map(item => (
                            <TableRow key={item.value}>
                                <TableCell>{item.value}</TableCell>
                                {tab === 'contatos' && (
                                    <TableCell>{item.active ? 'Sim' : 'Não'}</TableCell>
                                )}
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

                                    {tab === 'contatos' ? (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteOrInactivate(item.value)}
                                        >
                                            <RemoveCircleOutlineIcon fontSize="small" />
                                        </IconButton>
                                    ) : (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteOrInactivate(item.value)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
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
                        fullWidth
                        margin="dense"
                        label="Valor"
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
