import { useState, useEffect } from 'react';

export default function DespesaForm({ onSuccess, categorias, contas, despesaToEdit }) {
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    categoria_id: '',
    conta_id: '',
    data_despesa: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (despesaToEdit) {
      setForm({ ...despesaToEdit });
    }
  }, [despesaToEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = despesaToEdit ? 'PUT' : 'POST';
    const body = JSON.stringify(despesaToEdit ? { ...form, id: despesaToEdit.id } : form);

    const response = await fetch('/api/despesas', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (response.ok) {
      onSuccess();
    } else {
      alert('Ocorreu um erro.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="descricao" value={form.descricao} placeholder="Descrição (ex: Almoço)" onChange={handleChange} required className="w-full p-2 border rounded bg-transparent" />
      <input name="valor" value={form.valor} type="number" step="0.01" placeholder="Valor" onChange={handleChange} required className="w-full p-2 border rounded bg-transparent" />
      <select name="categoria_id" value={form.categoria_id} onChange={handleChange} required className="w-full p-2 border rounded bg-transparent">
        <option value="">Selecione a Categoria</option>
        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>
      <select name="conta_id" value={form.conta_id} onChange={handleChange} required className="w-full p-2 border rounded bg-transparent">
        <option value="">Selecione a Conta</option>
        {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>
      <input name="data_despesa" value={form.data_despesa} type="date" onChange={handleChange} required className="w-full p-2 border rounded bg-transparent" />
      <button type="submit" className="w-full px-4 py-2 bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
        {despesaToEdit ? 'Atualizar' : 'Adicionar'}
      </button>
    </form>
  );
}