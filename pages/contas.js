import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import Modal from '../components/Modal';
import ContaForm from '../components/ContaForm';
import pool from '../lib/db';
import { getAllContas } from '../lib/services/contas.service';

export default function ContasPage({ contas, serverError }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contaToEdit, setContaToEdit] = useState(null);
  const router = useRouter();

  const openModal = () => setIsModalOpen(true);
  
  const closeModal = () => {
    setContaToEdit(null);
    setIsModalOpen(false);
  };
  
  const refreshData = () => {
    router.replace(router.asPath);
    closeModal();
  };

  const handleEdit = (conta) => {
    setContaToEdit(conta);
    openModal();
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta? Isso pode afetar receitas e despesas associadas.')) {
      const response = await fetch(`/api/contas?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        refreshData();
      } else {
        alert('Falha ao excluir a conta.');
      }
    }
  };

  const handleDuplicate = (conta) => {
    const { id, ...contaData } = conta;
    setContaToEdit(contaData);
    openModal();
  };

  if (serverError) {
    return <Layout><p className="text-red-500">{serverError}</p></Layout>;
  }
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Contas</h1>
        <button onClick={openModal} className="px-4 py-2 bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
          Adicionar Conta
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={contaToEdit ? 'Editar Conta' : 'Nova Conta'}>
        <ContaForm
          onSuccess={refreshData}
          contaToEdit={contaToEdit}
        />
      </Modal>

      <div className="overflow-x-auto bg-card-light dark:bg-card-dark rounded-lg shadow">
        <table className="min-w-full">
          <thead className="border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Saldo Inicial</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {contas.map((conta) => (
              <tr key={conta.id}>
                <td className="px-6 py-4 whitespace-nowrap">{conta.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{conta.tipo}</td>
                <td className="px-6 py-4 whitespace-nowrap">R$ {parseFloat(conta.saldo_inicial).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDuplicate(conta)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-4">Duplicar</button>
                  <button onClick={() => handleEdit(conta)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 mr-4">Editar</button>
                  <button onClick={() => handleDelete(conta.id)} className="text-red-600 hover:text-red-900 dark:text-red-400">Excluir</button>
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
    const contas = await getAllContas(); // Chama a função do serviço
    return {
      props: {
        contas, // Já vem serializado do serviço
      },
    };
  } catch (error) {
    console.error("Erro no getServerSideProps de Contas:", error);
    return {
      props: {
        serverError: 'Não foi possível conectar ao banco de dados.',
        contas: []
      },
    };
  }
}