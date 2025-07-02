import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import API_URL from '../config';

export default function AtendimentoList({ atendimentos, token, onDelete, onEdit }) {
  const handleDelete = id => {
    if (!window.confirm('Deseja excluir este atendimento?')) return;
    fetch(`${API_URL}/api/atendimentos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error();
        onDelete();
      })
      .catch(() => alert('Erro ao excluir'));
  };

  const rows = Array.isArray(atendimentos)
    ? atendimentos.map(item => ({
      id: item.id,
      atendente: item.atendente,
      sector: item.sector,
      dia: item.dia,
      hora_inicio: item.hora_inicio,
      hora_fim: item.hora_fim,
      loja: item.loja,
      contato: item.contato,
      ocorrencia: item.ocorrencia,
      observacao: item.observacao
    }))
    : [];

  const columns = [
    { field: 'atendente', headerName: 'Atendente', flex: 1 },
    { field: 'sector', headerName: 'Setor', flex: 1 },
    {
      field: 'dia',
      headerName: 'Data',
      flex: 1,
      valueFormatter: params => {
        try {
          return new Date(params.value).toLocaleDateString('pt-BR');
        } catch {
          return '';
        }
      }
    },
    { field: 'hora_inicio', headerName: 'Início', flex: 1 },
    { field: 'hora_fim', headerName: 'Término', flex: 1 },
    { field: 'loja', headerName: 'Loja', flex: 1 },
    { field: 'contato', headerName: 'Contato', flex: 1 },
    { field: 'ocorrencia', headerName: 'Ocorrência', flex: 1 },
    { field: 'observacao', headerName: 'Observação', flex: 1 },
    {
      field: 'actions',
      headerName: 'Ações',
      sortable: false,
      filterable: false,
      renderCell: params => (
        <>
          <IconButton color="primary" onClick={() => onEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.id)}>
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <div style={{ width: '100%', height: 400 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 50, 100]}
        disableSelectionOnClick
        autoHeight
      />
    </div>
  );
}
