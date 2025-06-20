import { useState, useEffect } from 'react';

export default function ContaForm({ onSuccess, contaToEdit }) {
  const [form, setForm] = useState({
    nome: '',
    tipo: '',
    saldo_inicial: '',
  });

  useEffect(() => {
    if (contaToEdit) {
      setForm({
        nome: contaToEdit.nome || '',
        tipo: contaToEdit.tipo || '',
        saldo_inicial: contaToEdit.saldo_inicial || '',
      });
    }
  }, [contaToEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = contaToEdit ? `/api/contas?id=${contaToEdit.id}` : '/api/contas';
    const method = contaToEdit ? 'PUT' : 'POST';

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
      <input name="nome" value={form.nome} placeholder="Nome da Conta (ex: Carteira)" onChange={handleChange} required className="w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600" />
      <input name="tipo" value={form.tipo} placeholder="Tipo (ex: Conta Corrente)" onChange={handleChange} required className="w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600" />
      <input name="saldo_inicial" value={form.saldo_inicial} type="number" step="0.01" placeholder="Saldo Inicial" onChange={handleChange} required className="w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600" />
      <button type="submit" className="w-full px-4 py-2 bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
        {contaToEdit ? 'Atualizar Conta' : 'Adicionar Conta'}
      </button>
    </form>
  );
}