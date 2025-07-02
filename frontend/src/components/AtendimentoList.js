import React, { useState, useEffect } from 'react';
import AtendimentoForm from './AtendimentoForm';

const AtendimentoList = () => {
  const [atendimentos, setAtendimentos] = useState([]);
  const [editItem, setEditItem] = useState(null);

  const fetchAtendimentos = async () => {
    const res = await fetch('/api/atendimentos');
    const data = await res.json();
    setAtendimentos(data);
  };

  useEffect(() => {
    fetchAtendimentos();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir este atendimento?')) return;
    await fetch(`/api/atendimentos/${id}`, { method: 'DELETE' });
    fetchAtendimentos();
  };

  const handleEdit = (item) => {
    setEditItem(item);
  };

  const handleSave = async () => {
    setEditItem(null);
    fetchAtendimentos();
  };

  return (
    <div>
      <h2>Lista de Atendimentos</h2>
      {editItem && (
        <AtendimentoForm
          initialData={editItem}
          onSave={handleSave}
          onCancel={() => setEditItem(null)}
        />
      )}
      <table>
        <thead>
          <tr>
            <th>Atendente</th>
            <th>Setor</th>
            <th>Dia</th>
            <th>Hora Início</th>
            <th>Hora Fim</th>
            <th>Loja</th>
            <th>Contato</th>
            <th>Ocorrência</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {atendimentos.map((item) => (
            <tr key={item.id}>
              <td>{item.atendente}</td>
              <td>{item.setor}</td>
              <td>{item.dia}</td>
              <td>{item.hora_inicio}</td>
              <td>{item.hora_fim}</td>
              <td>{item.loja}</td>
              <td>{item.contato}</td>
              <td>{item.ocorrencia}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Editar</button>
                <button onClick={() => handleDelete(item.id)} style={{ marginLeft: 8, color: 'red' }}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AtendimentoList;
