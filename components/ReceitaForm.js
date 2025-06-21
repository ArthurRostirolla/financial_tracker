import { useState, useEffect } from 'react';

export default function ReceitaForm({ onSuccess, categorias, contas, receitaToEdit }) {
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    categoria_id: '',
    conta_id: '',
    data_receita: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (receitaToEdit) {
      setForm({
        descricao: receitaToEdit.descricao || '',
        valor: receitaToEdit.valor || '',
        categoria_id: receitaToEdit.categoria_id || '',
        conta_id: receitaToEdit.conta_id || '',
        data_receita: receitaToEdit.data_receita ? new Date(receitaToEdit.data_receita).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
  }, [receitaToEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = receitaToEdit ? `/api/receitas?id=${receitaToEdit.id}` : '/api/receitas';
    const method = receitaToEdit ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      onSuccess();
    } else {
      const errorData = await response.json();
      alert(`Ocorreu um erro: ${errorData.message}`);
    }
  };

 return (
    <form onSubmit={handleSubmit} className="space-y-4 text-text-light dark:text-text-dark">
      <input name="descricao" value={form.descricao} placeholder="Descrição (ex: Salário)" onChange={handleChange} required className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
      <input name="valor" value={form.valor} type="number" step="0.01" placeholder="Valor" onChange={handleChange} required className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
      <select name="categoria_id" value={form.categoria_id} onChange={handleChange} required className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
        <option value="">Selecione a Categoria</option>
        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>
      <select name="conta_id" value={form.conta_id} onChange={handleChange} required className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
        <option value="">Selecione a Conta</option>
        {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>
      <input name="data_receita" value={form.data_receita} type="date" onChange={handleChange} required className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
      <button type="submit" className="w-full px-4 py-2 bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
        {receitaToEdit ? 'Atualizar Receita' : 'Adicionar Receita'}
      </button>
    </form>
  );
}