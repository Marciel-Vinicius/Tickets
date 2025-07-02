import React, { useEffect, useState } from 'react';
import AtendimentoForm from './AtendimentoForm';

function AtendimentoList({ apiUrl, token }) {
  const [atendimentos, setAtendimentos] = useState([]);
  const [editing, setEditing] = useState(null);

  const fetchAtendimentos = async () => {
    const res = await fetch(`${apiUrl}/atendimentos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAtendimentos(await res.json());
  };

  useEffect(() => { fetchAtendimentos(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;
    await fetch(`${apiUrl}/atendimentos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAtendimentos();
  };

  const handleEdit = (item) => setEditing(item);

  const handleFormClose = () => setEditing(null);

  const handleFormSave = () => {
    setEditing(null);
    fetchAtendimentos();
  };

  return (
    <div>
      <h2>Lista de Atendimentos</h2>
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
                <button onClick={() => handleDelete(item.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing &&
        <AtendimentoForm
          apiUrl={apiUrl}
          token={token}
          initialData={editing}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />}
    </div>
  );
}

export default AtendimentoList;
