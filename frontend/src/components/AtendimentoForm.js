import React, { useState } from 'react';

const defaultData = {
  atendente: '',
  dia: '',
  horaInicio: '',
  horaFim: '',
  loja: '',
  contato: '',
  ocorrencia: ''
};

const AtendimentoForm = ({ initialData, onSave, onCancel }) => {
  const [form, setForm] = useState(initialData || defaultData);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(initialData);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = isEdit ? `/api/atendimentos/${initialData.id}` : '/api/atendimentos';
    const method = isEdit ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    setLoading(false);
    onSave && onSave();
    setForm(defaultData);
  };

  return (
    <div style={{ border: '1px solid #ddd', marginBottom: 16, padding: 16 }}>
      <h3>{isEdit ? 'Editar Atendimento' : 'Novo Atendimento'}</h3>
      <form onSubmit={handleSubmit}>
        <input name="atendente" value={form.atendente} onChange={handleChange} placeholder="Atendente" required /><br />
        <input name="dia" type="date" value={form.dia} onChange={handleChange} required /><br />
        <input name="horaInicio" value={form.horaInicio} onChange={handleChange} placeholder="Hora início" required /><br />
        <input name="horaFim" value={form.horaFim} onChange={handleChange} placeholder="Hora fim" required /><br />
        <input name="loja" value={form.loja} onChange={handleChange} placeholder="Loja" required /><br />
        <input name="contato" value={form.contato} onChange={handleChange} placeholder="Contato" required /><br />
        <input name="ocorrencia" value={form.ocorrencia} onChange={handleChange} placeholder="Ocorrência" required /><br />

        <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Cancelar</button>
        )}
      </form>
    </div>
  );
};

export default AtendimentoForm;
