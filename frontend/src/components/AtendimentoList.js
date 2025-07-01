// frontend/src/components/AtendimentoList.js
import React from 'react';
import API_URL from '../config';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AtendimentoList({ atendimentos, token, onDelete }) {
  const handleDelete = id =>
    fetch(`${API_URL}/api/atendimentos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    }).then(onDelete);

  const columns = [
    { field: 'atendente', headerName: 'Atendente', flex: 1, minWidth: 120 },
    { field: 'setor', headerName: 'Setor', flex: 1, minWidth: 100 },

    {
      field: 'dia',
      headerName: 'Data',
      type: 'date',
      flex: 1,
      minWidth: 120,
      sortable: true,
      // valueGetter agora é seguro contra params undefined
      valueGetter: params => {
        const raw = params?.row?.dia;
        if (!raw) return null;
        return new Date(raw);
      },
      // formatamos a data para pt-BR
      valueFormatter: params => {
        const value = params?.value;
        if (!(value instanceof Date) || isNaN(value)) return '';
        return value.toLocaleDateString('pt-BR');
      }
    },

    { field: 'horaInicio', headerName: 'Início', flex: 0.7, minWidth: 100 },
    { field: 'horaFim', headerName: 'Término', flex: 0.7, minWidth: 100 },
    { field: 'loja', headerName: 'Loja', flex: 1, minWidth: 120 },
    { field: 'contato', headerName: 'Contato', flex: 1, minWidth: 150 },
    { field: 'ocorrencia', headerName: 'Ocorrência', flex: 2, minWidth: 200 },
    { field: 'observacao', headerName: 'Observação', flex: 1, minWidth: 120, sortable: false },

    {
      field: 'actions',
      headerName: 'Ações',
      flex: 0.5,
      sortable: false,
      renderCell: params => (
        <IconButton onClick={() => handleDelete(params.row.id)}>
          <DeleteIcon color="error" />
        </IconButton>
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
        rowsPerPageOptions={[5, 10, 25, 100]}
        disableSelectionOnClick
        autoHeight
        initialState={{
          sorting: {
            sortModel: [{ field: 'dia', sort: 'asc' }]
          }
        }}
      />
    </Box>
  );
}
