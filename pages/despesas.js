import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import Modal from '../components/Modal';
import DespesaForm from '../components/DespesaForm';
import pool from '../lib/db';
import { getAllDespesas } from '../lib/services/despesas.service';
import { getCategoriasPorTipo } from '../lib/services/categorias.service';
import { getAllContas } from '../lib/services/contas.service';
import { PlusCircle, PencilSimpleLine, Trash, Folders, Folder } from 'phosphor-react';

export default function DespesasPage({ despesas, categorias, contas, serverError }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [despesaToEdit, setDespesaToEdit] = useState(null);
  const router = useRouter();

  const openModal = () => setIsModalOpen(true);
  
  const closeModal = () => {
    setDespesaToEdit(null);
    setIsModalOpen(false);
  };
  
  const refreshData = () => {
    router.replace(router.asPath);
    closeModal();
  };

  const handleEdit = (despesa) => {
    setDespesaToEdit(despesa);
    openModal();
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      const response = await fetch(`/api/despesas?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        refreshData();
      } else {
        alert('Falha ao excluir a despesa.');
      }
    }
  };

  // Duplicar: Pega os dados, abre o modal sem o ID
  const handleDuplicate = (despesa) => {
    const { id, ...despesaData } = despesa;
    setDespesaToEdit(despesaData); // Manda para o form, mas sem o ID
    openModal();
  };
  
  if (serverError) {
    return <Layout><p className="text-red-500">{serverError}</p></Layout>;
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Despesas</h1>
        <button onClick={openModal} className="px-4 py-2 bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
          Adicionar Despesa
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={despesaToEdit ? 'Editar Despesa' : 'Nova Despesa'}>
        <DespesaForm
          onSuccess={refreshData}
          categorias={categorias}
          contas={contas}
          despesaToEdit={despesaToEdit}
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
            {despesas.map((despesa) => (
              <tr key={despesa.id}>
                <td className="px-6 py-4 whitespace-nowrap">{despesa.descricao}</td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600 dark:text-red-400">R$ {parseFloat(despesa.valor).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{despesa.categoria_nome || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{despesa.conta_nome || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(despesa.data_despesa).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDuplicate(despesa)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-4"><Folder /></button>
                  <button onClick={() => handleEdit(despesa)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 mr-4"><PencilSimpleLine /></button>
                  <button onClick={() => handleDelete(despesa.id)} className="text-red-600 hover:text-red-900 dark:text-red-400"><Trash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

// pages/despesas.js

export async function getServerSideProps() {
  try {
    const despesas = await getAllDespesas();
    const categorias = await getCategoriasPorTipo('despesa');
    const contas = await getAllContas();

    return {
      props: {
        despesas,
        categorias,
        contas,
      },
    };
  } catch (error) {
    console.error("Erro no getServerSideProps de Despesas:", error);
    return {
      props: {
        serverError: 'Não foi possível conectar ao banco de dados.',
        despesas: [],
        categorias: [],
        contas: [],
      },
    };
  }
}