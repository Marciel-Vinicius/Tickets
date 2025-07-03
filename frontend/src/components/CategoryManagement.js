// frontend/src/components/CategoryManagement.js
import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import {
    Box, Typography, TextField, Button,
    Table, TableHead, TableBody, TableRow, TableCell,
    IconButton, Checkbox, FormControlLabel, Alert, Grid, Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';

export default function CategoryManagement({ token }) {
    const [lojaNome, setLojaNome] = useState('');
    const [contatoNome, setContatoNome] = useState('');
    const [contatoCategoria, setContatoCategoria] = useState('');
    const [ocorrenciaDesc, setOcorrenciaDesc] = useState('');

    const [lojas, setLojas] = useState([]);
    const [contatos, setContatos] = useState([]);
    const [ocorrencias, setOcorrencias] = useState([]);

    const [showInactive, setShowInactive] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', text: '' });

    const fetchAll = () => {
        fetch(`${API_URL}/api/categories`, {
            headers: { Authorization: 'Bearer ' + token }
        })
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => {
                setLojas(data.lojas);
                setContatos(data.contatos);
                setOcorrencias(data.ocorrencias);
            })
            .catch(err => {
                console.error(err);
                setFeedback({ type: 'error', text: 'Erro ao carregar dados.' });
            });
    };

    useEffect(fetchAll, [token]);

    // Mensagens somem após 3s
    useEffect(() => {
        if (feedback.text) {
            const t = setTimeout(() => setFeedback({ type: '', text: '' }), 3000);
            return () => clearTimeout(t);
        }
    }, [feedback]);

    const addLoja = () => {
        if (!lojaNome) return;
        fetch(`${API_URL}/api/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({ nome: lojaNome })
        })
            .then(r => {
                if (!r.ok) throw new Error();
                setLojaNome('');
                fetchAll();
                setFeedback({ type: 'success', text: 'Loja adicionada.' });
            })
            .catch(() => setFeedback({ type: 'error', text: 'Erro ao adicionar loja.' }));
    };

    const addContato = () => {
        if (!contatoNome || !contatoCategoria) return;
        fetch(`${API_URL}/api/categories/contatos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({ nome: contatoNome, categoria: contatoCategoria })
        })
            .then(r => {
                if (!r.ok) throw new Error();
                setContatoNome('');
                setContatoCategoria('');
                fetchAll();
                setFeedback({ type: 'success', text: 'Contato adicionado.' });
            })
            .catch(() => setFeedback({ type: 'error', text: 'Erro ao adicionar contato.' }));
    };

    const addOcorrencia = () => {
        if (!ocorrenciaDesc) return;
        fetch(`${API_URL}/api/categories/ocorrencias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({ descricao: ocorrenciaDesc })
        })
            .then(r => {
                if (!r.ok) throw new Error();
                setOcorrenciaDesc('');
                fetchAll();
                setFeedback({ type: 'success', text: 'Ocorrência adicionada.' });
            })
            .catch(() => setFeedback({ type: 'error', text: 'Erro ao adicionar ocorrência.' }));
    };

    const deleteContato = id => {
        fetch(`${API_URL}/api/categories/contatos/${id}`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + token }
        }).then(() => {
            fetchAll();
            setFeedback({ type: 'success', text: 'Contato removido.' });
        }).catch(() =>
            setFeedback({ type: 'error', text: 'Erro ao remover contato.' })
        );
    };

    const inactivateContato = id => {
        fetch(`${API_URL}/api/categories/contatos/${id}/inactivate`, {
            method: 'PATCH',
            headers: { Authorization: 'Bearer ' + token }
        })
            .then(r => {
                if (!r.ok) throw new Error();
                fetchAll();
                setFeedback({ type: 'success', text: 'Contato inativado.' });
            })
            .catch(() =>
                setFeedback({ type: 'error', text: 'Erro ao inativar contato.' })
            );
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Gerenciamento de Categorias & Contatos</Typography>
            {feedback.text && (
                <Alert severity={feedback.type} sx={{ mb: 2 }}>
                    {feedback.text}
                </Alert>
            )}

            <Grid container spacing={4}>
                {/* Seção de Lojas */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1">Nova Loja</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <TextField
                                label="Nome da Loja"
                                value={lojaNome}
                                onChange={e => setLojaNome(e.target.value)}
                                fullWidth
                                size="small"
                            />
                            <Button variant="contained" onClick={addLoja}>
                                Adicionar
                            </Button>
                        </Box>
                        <Box component="ul" sx={{ mt: 2 }}>
                            {lojas.map(l => (
                                <li key={l}>{l}</li>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Seção de Contatos */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1">Novo Contato (Vendedor)</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <TextField
                                label="Nome do Contato"
                                value={contatoNome}
                                onChange={e => setContatoNome(e.target.value)}
                                size="small"
                            />
                            <TextField
                                label="Categoria (Loja)"
                                value={contatoCategoria}
                                onChange={e => setContatoCategoria(e.target.value)}
                                size="small"
                            />
                            <Button variant="contained" onClick={addContato}>
                                Adicionar
                            </Button>
                        </Box>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={showInactive}
                                    onChange={e => setShowInactive(e.target.checked)}
                                />
                            }
                            label="Mostrar inativos"
                            sx={{ mt: 2 }}
                        />

                        <Table size="small" sx={{ mt: 1 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Loja</TableCell>
                                    <TableCell>Ativo</TableCell>
                                    <TableCell align="right">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {contatos
                                    .filter(c => showInactive || c.ativo)
                                    .map(c => (
                                        <TableRow key={c.id}>
                                            <TableCell>{c.nome}</TableCell>
                                            <TableCell>{c.categoria}</TableCell>
                                            <TableCell>{c.ativo ? 'Sim' : 'Não'}</TableCell>
                                            <TableCell align="right">
                                                {c.ativo && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => inactivateContato(c.id)}
                                                    >
                                                        <BlockIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                                <IconButton
                                                    size="small"
                                                    onClick={() => deleteContato(c.id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>

                {/* Seção de Ocorrências */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1">Nova Ocorrência</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <TextField
                                label="Descrição"
                                value={ocorrenciaDesc}
                                onChange={e => setOcorrenciaDesc(e.target.value)}
                                fullWidth
                                size="small"
                            />
                            <Button variant="contained" onClick={addOcorrencia}>
                                Adicionar
                            </Button>
                        </Box>
                        <Box component="ul" sx={{ mt: 2 }}>
                            {ocorrencias.map(o => (
                                <li key={o}>{o}</li>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
