// frontend/src/components/AtendimentoList.js
import React, { useState, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  DataGrid,
  GridToolbar
} from '@mui/x-data-grid';
import API_URL from '../config';

export default function AtendimentoList({ token }) {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetch(`${API_URL}/api/atendimentos`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data =>
        setRows(
          data.map(item => ({
            id: item.id,
            atendente: item.atendente,
            data: new Date(item.dia).toLocaleDateString('pt-BR'),
            horaInicio: item.hora_inicio,
            horaFim: item.hora_fim,
            loja: item.loja,
            contato: item.contato,
            ocorrencia: item.ocorrencia
          }))
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
    <Box sx={{ width: '100%' }}>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={newSize => setPageSize(newSize)}
        rowsPerPageOptions={[5, 10, 20, 50]}
        pagination
        components={{ Toolbar: GridToolbar }}
        sx={{
          width: '100%',
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
