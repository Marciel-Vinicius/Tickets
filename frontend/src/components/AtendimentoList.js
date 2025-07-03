// frontend/src/components/AtendimentoList.js
import React, { useState, useEffect } from 'react';
import {
  Paper, Box, Typography, Table,
  TableHead, TableRow, TableCell,
  TableBody, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import API_URL from '../config';

export default function AtendimentoList({ token }) {
  const [items, setItems] = useState([]);

  const fetchItems = () => {
    fetch(`${API_URL}/api/atendimentos`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(data => setItems(data));
  };

  useEffect(fetchItems, [token]);

  const handleDelete = id => {
    if (!window.confirm('Confirma exclusão?')) return;
    fetch(`${API_URL}/api/atendimentos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    }).then(fetchItems);
  };

  const handleEdit = id => {
    // reutilize a lógica existente de edição
  };

  return (
    <Paper>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Lista de Atendimentos</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Atendente</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Início</TableCell>
              <TableCell>Fim</TableCell>
              <TableCell>Loja</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell>Ocorrência</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(row => (
              <TableRow key={row.id} hover>
                <TableCell>{row.atendente}</TableCell>
                <TableCell>{row.dia}</TableCell>
                <TableCell>{row.hora_inicio}</TableCell>
                <TableCell>{row.hora_fim}</TableCell>
                <TableCell>{row.loja}</TableCell>
                <TableCell>{row.contato}</TableCell>
                <TableCell>{row.ocorrencia}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(row.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(row.id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
