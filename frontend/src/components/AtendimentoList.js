// frontend/src/components/AtendimentoList.js
import React from 'react';
import API_URL from '../config';
import { DataGrid } from '@mui/x-data-grid';
import {
  IconButton,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function AtendimentoList({ atendimentos, token, onDelete, onEdit }) {
  const handleDelete = id =>
    fetch(`${API_URL}/api/atendimentos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    }).then(onDelete);

  const columns = [
    { field: 'atendente', headerName: 'Atendente', flex: 1, minWidth: 120 },
    { field: 'sector', headerName: 'Setor', flex: 1, minWidth: 100 },
    {
      field: 'dia',
      headerName: 'Data',
      flex: 1,
      minWidth: 120,
      renderCell: ({ row }) => {
        const raw = row.dia.split('T')[0];
        const [y, m, d] = raw.split('-');
        return `${d}/${m}/${y}`;
      }
    },
    { field: 'hora_inicio', headerName: 'Início', flex: 0.7, minWidth: 100 },
    { field: 'hora_fim', headerName: 'Término', flex: 0.7, minWidth: 100 },
    { field: 'loja', headerName: 'Loja', flex: 1, minWidth: 120 },
    { field: 'contato', headerName: 'Contato', flex: 1, minWidth: 150 },
    { field: 'ocorrencia', headerName: 'Ocorrência', flex: 2, minWidth: 200 },
    {
      field: 'actions',
      headerName: 'Ações',
      flex: 0.6,
      sortable: false,
      renderCell: params => (
        <>
          <IconButton
            color="primary"
            onClick={() => onEdit(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={atendimentos}
        columns={columns}
        getRowId={row => row.id}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 25]}
        disableSelectionOnClick
        autoHeight
      />
    </Box>
  );
}
