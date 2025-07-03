// frontend/src/components/AtendimentoList.js
import React, { useState, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  DataGrid,
  GridToolbarQuickFilter
} from '@mui/x-data-grid';
import API_URL from '../config';

export default function AtendimentoList({ token }) {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);

  const fetchItems = () => {
    fetch(`${API_URL}/api/atendimentos`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
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
  };

  useEffect(fetchItems, [token]);

  const columns = [
    { field: 'atendente', headerName: 'Atendente', flex: 1 },
    { field: 'data', headerName: 'Data', flex: 1 },
    { field: 'horaInicio', headerName: 'Início', flex: 1 },
    { field: 'horaFim', headerName: 'Fim', flex: 1 },
    { field: 'loja', headerName: 'Loja', flex: 2 },
    { field: 'contato', headerName: 'Contato', flex: 2 },
    { field: 'ocorrencia', headerName: 'Ocorrência', flex: 2 }
    // você pode adicionar colunas de Ações aqui se quiser
  ];

  return (
    <Box sx={{ height: 500, width: '100%', background: theme.palette.background.paper }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={newSize => setPageSize(newSize)}
        rowsPerPageOptions={[5, 10, 20]}
        pagination
        components={{ Toolbar: GridToolbarQuickFilter }}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.background.paper
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: theme.palette.background.default
          }
        }}
      />
    </Box>
  );
}
