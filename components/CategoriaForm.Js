import { useState, useEffect } from 'react';

export default function CategoriaForm({ onSuccess, categoriaToEdit }) {
  const [form, setForm] = useState({
    nome: '',
    tipo: 'despesa', // Valor padrão
  });

  useEffect(() => {
    if (categoriaToEdit) {
      setForm({
        nome: categoriaToEdit.nome || '',
        tipo: categoriaToEdit.tipo || 'despesa',
      });
    }
  }, [categoriaToEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = categoriaToEdit ? `/api/categorias?id=${categoriaToEdit.id}` : '/api/categorias';
    const method = categoriaToEdit ? 'PUT' : 'POST';

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
      <input 
        name="nome" 
        value={form.nome} 
        placeholder="Nome da Categoria" 
        onChange={handleChange} 
        required 
        className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" 
      />
      <select 
        name="tipo" 
        value={form.tipo} 
        onChange={handleChange} 
        required 
        className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
      >
        <option value="despesa">Despesa</option>
        <option value="receita">Receita</option>
      </select>
      <button type="submit" className="w-full px-4 py-2 bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
        {categoriaToEdit ? 'Atualizar Categoria' : 'Adicionar Categoria'}
      </button>
    </form>
  );
}