import { useState } from 'react';
export default function DespesaForm({ onSuccess }) {
  const [form,setForm] = useState({descricao:'',valor:'',categoria_id:'',conta_id:'',data_despesa:''});
  const handleChange=e=>setForm({...form,[e.target.name]:e.target.value});
  const handleSubmit=async e=>{
    e.preventDefault();
    await fetch('/api/despesas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
    onSuccess();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input name="descricao" placeholder="Descrição" onChange={handleChange} className="w-full p-2 border" />
      <input name="valor" placeholder="Valor" onChange={handleChange} className="w-full p-2 border" />
      <input name="data_despesa" type="date" onChange={handleChange} className="w-full p-2 border" />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Adicionar</button>
    </form>
  );
}