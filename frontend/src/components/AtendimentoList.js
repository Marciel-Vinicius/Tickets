// frontend/src/components/AtendimentoList.js
import React, { useState, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import API_URL from '../config';

export default function AtendimentoList({ token }) {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);

  // busca todos os atendimentos
  useEffect(() => {
    fetch(`${API_URL}/api/atendimentos`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data =>
        setRows(
          data.map(item => {
            // item.dia vem como 'YYYY-MM-DD'
            const [year, month, day] = item.dia.split('-');
            return {
              id: item.id,
              atendente: item.atendente,
              data: `${day}/${month}/${year}`,
              horaInicio: item.hora_inicio,
              horaFim: item.hora_fim,
              loja: item.loja,
              contato: item.contato,
              ocorrencia: item.ocorrencia
            };
          })
        )
      )
      .catch(() => alert('Falha ao carregar atendimentos.'));
  }, [token]);

  const columns = [
    { field: 'atendente', headerName: 'Atendente', flex: 1, minWidth: 150 },
    { field: 'data', headerName: 'Data', flex: 1, minWidth: 120 },
    { field: 'horaInicio', headerName: 'Início', flex: 1, minWidth: 120 },
    { field: 'horaFim', headerName: 'Fim', flex: 1, minWidth: 120 },
    { field: 'loja', headerName: 'Loja', flex: 2, minWidth: 150 },
    { field: 'contato', headerName: 'Contato', flex: 2, minWidth: 150 },
    { field: 'ocorrencia', headerName: 'Ocorrência', flex: 2, minWidth: 150 }
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 260px)', // ajuste para seu header+form
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
