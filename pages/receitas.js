// pages/receitas.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import Modal from '../components/Modal';
import ReceitaForm from '../components/ReceitaForm';
import { getAllReceitas } from '../lib/services/receitas.service';
import { getCategoriasPorTipo } from '../lib/services/categorias.service'; 
import { getAllContas } from '../lib/services/contas.service';
import { PencilSimpleLine, Trash, Folders } from 'phosphor-react';

export default function ReceitasPage({ receitas, categorias, contas, serverError }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receitaToEdit, setReceitaToEdit] = useState(null);
  const router = useRouter();

  const openModal = () => setIsModalOpen(true);
  
  const closeModal = () => {
    setReceitaToEdit(null);
    setIsModalOpen(false);
  };

  const refreshData = () => {
    router.replace(router.asPath);
    closeModal();
  };

  const handleEdit = (receita) => {
    setReceitaToEdit(receita);
    openModal();
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      const response = await fetch(`/api/receitas?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        refreshData();
      } else {
        alert('Falha ao excluir a receita.');
      }
    }
  };

  const handleDuplicate = async (receita) => {
    const { id, ...receitaData } = receita;

    const response = await fetch('/api/receitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receitaData),
    });

    if (response.ok) {
      router.replace(router.asPath);
    } else {
      const errorData = await response.json();
      alert(`Ocorreu um erro ao duplicar: ${errorData.message}`);
    }
  };

  if (serverError) {
    return <Layout><p className="text-red-500">{serverError}</p></Layout>;
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Receitas</h1>
        <button onClick={openModal} className="px-4 py-2 bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
          Adicionar Receita
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={receitaToEdit ? 'Editar Receita' : 'Nova Receita'}>
        <ReceitaForm
          onSuccess={refreshData}
          categorias={categorias}
          contas={contas}
          receitaToEdit={receitaToEdit}
        />
      </Modal>

      <div className="overflow-x-auto bg-card-light dark:bg-card-dark rounded-lg shadow">
        <table className="min-w-full">
          <thead className="border-b border-gray-200 dark:border-gray-700">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Conta</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {receitas.map((receita) => (
              <tr key={receita.id}>
                <td className="px-6 py-4 whitespace-nowrap">{receita.descricao}</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 dark:text-green-400">R$ {parseFloat(receita.valor).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{receita.categoria_nome || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{receita.conta_nome || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(receita.data_receita).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDuplicate(receita)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-4"><Folders /></button>
                  <button onClick={() => handleEdit(receita)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 mr-4"><PencilSimpleLine/></button>
                  <button onClick={() => handleDelete(receita.id)} className="text-red-600 hover:text-red-900 dark:text-red-400"><Trash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const receitas = await getAllReceitas();
    const categorias = await getCategoriasPorTipo('receita');
    const contas = await getAllContas();

    return {
      props: {
        receitas,
        categorias,
        contas,
      },
    };
  } catch (error) {
    console.error("Erro no getServerSideProps de Receitas:", error);
    return {
      props: {
        serverError: 'Não foi possível conectar ao banco de dados.',
        receitas: [],
        categorias: [],
        contas: [],
      },
    };
  }
}