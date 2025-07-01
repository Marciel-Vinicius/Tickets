// frontend/src/components/AtendimentoList.js
import React from 'react';
import API_URL from '../config';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AtendimentoList({ atendimentos, token, onDelete }) {
  const handleDelete = id => {
    fetch(`${API_URL}/api/atendimentos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    }).then(onDelete);
  };

  const columns = [
    {
      field: 'atendente',
      headerName: 'Atendente',
      flex: 1,
      minWidth: 120,
      valueGetter: params => params?.row?.atendente ?? ''
    },
    {
      field: 'setor',
      headerName: 'Setor',
      flex: 1,
      minWidth: 100,
      valueGetter: params => params?.row?.setor ?? ''
    },
    {
      field: 'dia',
      headerName: 'Data',
      flex: 1,
      minWidth: 100,
      valueGetter: params => params?.row?.dia ?? '',
      valueFormatter: params => {
        const raw = params.value;
        if (!raw) return '';
        const iso = String(raw).split('T')[0];
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
      },
      sortable: true
    },
    {
      field: 'horaInicio',
      headerName: 'Início',
      flex: 0.7,
      minWidth: 100,
      valueGetter: params =>
        params?.row?.horaInicio ?? params?.row?.hora_inicio ?? ''
    },
    {
      field: 'horaFim',
      headerName: 'Término',
      flex: 0.7,
      minWidth: 100,
      valueGetter: params =>
        params?.row?.horaFim ?? params?.row?.hora_fim ?? ''
    },
    {
      field: 'loja',
      headerName: 'Loja',
      flex: 1,
      minWidth: 120,
      valueGetter: params => params?.row?.loja ?? ''
    },
    {
      field: 'contato',
      headerName: 'Contato',
      flex: 1,
      minWidth: 150,
      valueGetter: params => params?.row?.contato ?? ''
    },
    {
      field: 'ocorrencia',
      headerName: 'Ocorrência',
      flex: 2,
      minWidth: 200,
      valueGetter: params => params?.row?.ocorrencia ?? ''
    },
    {
      field: 'observacao',
      headerName: 'Observação',
      flex: 1,
      minWidth: 120,
      valueGetter: params => params?.row?.observacao ?? ''
    },
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
