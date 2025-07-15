// frontend/src/components/AtendimentoList.js
import React, { useState, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import { DataGrid, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AtendimentoList({ atendimentos, onEdit, onDelete }) {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (Array.isArray(atendimentos)) {
      const mappedRows = atendimentos.map(item => ({
        id: item.id,
        atendente: item.atendente,
        dia: item.dia,
        horaInicio: item.hora_inicio,
        horaFim: item.hora_fim,
        loja: item.loja,
        contato: item.contato,
        ocorrencia: item.ocorrencia
      }));
      setRows(mappedRows);
    }
  }, [atendimentos]);

  const columns = [
    { field: 'atendente', headerName: 'Atendente', flex: 1, minWidth: 150 },
    { field: 'dia', headerName: 'Data', flex: 1, minWidth: 120 },
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
          icon={<EditIcon />}
          label="Editar"
          onClick={() => onEdit && onEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Excluir"
          onClick={() => onDelete && onDelete(params.id)}
        />
      ]
    }
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 260px)',
        width: '100%'
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={newSize => setPageSize(newSize)}
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        pagination
        components={{ Toolbar: GridToolbar }}
        sx={{
          flex: 1,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.action.hover
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: theme.palette.background.default
          }
        }}
      />
    </Box>
  );
}
