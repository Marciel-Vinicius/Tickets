import React, { useState } from 'react';

function AtendimentoForm({ apiUrl, token, initialData = null, onClose, onSave }) {
  const [atendente, setAtendente] = useState(initialData?.atendente || '');
  const [dia, setDia] = useState(initialData?.dia || '');
  const [horaInicio, setHoraInicio] = useState(initialData?.hora_inicio || '');
  const [horaFim, setHoraFim] = useState(initialData?.hora_fim || '');
  const [loja, setLoja] = useState(initialData?.loja || '');
  const [contato, setContato] = useState(initialData?.contato || '');
  const [ocorrencia, setOcorrencia] = useState(initialData?.ocorrencia || '');

  const isEdit = !!initialData;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const atendimento = {
      atendente,
      dia,
      horaInicio,
      horaFim,
      loja,
      contato,
      ocorrencia,
    };

    const url = isEdit
      ? `${apiUrl}/atendimentos/${initialData.id}`
      : `${apiUrl}/atendimentos`;

    const method = isEdit ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(atendimento),
    });

    if (onSave) onSave();
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h3>{isEdit ? 'Editar Atendimento' : 'Novo Atendimento'}</h3>
        <label>
          Atendente:
          <input value={atendente} onChange={e => setAtendente(e.target.value)} required />
        </label>
        <label>
          Dia:
          <input type="date" value={dia} onChange={e => setDia(e.target.value)} required />
        </label>
        <label>
          Hora Início:
          <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} required />
        </label>
        <label>
          Hora Fim:
          <input type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)} />
        </label>
        <label>
          Loja:
          <input value={loja} onChange={e => setLoja(e.target.value)} required />
        </label>
        <label>
          Contato:
          <input value={contato} onChange={e => setContato(e.target.value)} required />
        </label>
        <label>
          Ocorrência:
          <input value={ocorrencia} onChange={e => setOcorrencia(e.target.value)} required />
        </label>
        <div style={{ marginTop: '1em' }}>
          <button type="submit">{isEdit ? 'Salvar' : 'Cadastrar'}</button>
          <button type="button" onClick={onClose} style={{ marginLeft: 10 }}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default AtendimentoForm;
