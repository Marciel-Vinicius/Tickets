import React, { useState, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import apiFetch from '../api';

export default function AtendimentoList({ token, onEdit, onDelete }) {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    apiFetch('/atendimentos')
      .then(data => {
        const mapped = data.map(item => {
          const [y, m, d] = item.dia.split('-');
          return {
            id: item.id,
            atendente: item.atendente,
            data: `${d}/${m}/${y}`,
            horaInicio: item.hora_inicio,
            horaFim: item.hora_fim,
            loja: item.loja,
            contato: item.contato,
            ocorrencia: item.ocorrencia
          };
        });
        setRows(mapped);
      })
      .catch(err => {
        if (err.message !== 'Unauthorized') alert(err.message);
      });
  }, [token]);

  const columns = [
    { field: 'atendente', headerName: 'Atendente', flex: 1, minWidth: 150 },
    { field: 'data', headerName: 'Data', flex: 1, minWidth: 120 },
    { field: 'horaInicio', headerName: 'Início', flex: 1, minWidth: 120 },
    { field: 'horaFim', headerName: 'Fim', flex: 1, minWidth: 120 },
    { field: 'loja', headerName: 'Loja', flex: 2, minWidth: 150 },
    { field: 'contato', headerName: 'Contato', flex: 2, minWidth: 150 },
    { field: 'ocorrencia', headerName: 'Ocorrência', flex: 2, minWidth: 150 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      getActions: params => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Editar"
          onClick={() => onEdit(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon color="error" />}
          label="Excluir"
          onClick={() => onDelete(params.row.id)}
        />
      ]
    }
  ];

  return (
    <Box sx={{
      height: 'calc(100vh - 300px)',
      width: '100%'
    }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        rowsPerPageOptions={[5, 10, 20, 50]}
        pagination
        components={{ Toolbar: GridToolbar }}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.action.hover
          }
        }}
      />
    </Box>
  );
}
