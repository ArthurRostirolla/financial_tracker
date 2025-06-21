// pages/contas.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import Modal from '../components/Modal';
import ContaForm from '../components/ContaForm';
import { getAllContas } from '../lib/services/contas.service';
import { Folders, PencilSimpleLine, Trash } from 'phosphor-react';

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

  const handleDuplicate = async (conta) => {
    const { id, ...contaData } = conta;
    // Modifica o nome para indicar que é uma cópia
    contaData.nome = `${contaData.nome} (Cópia)`;
    
    const response = await fetch('/api/contas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contaData),
    });

    if (response.ok) {
      router.replace(router.asPath); // Atualiza a página
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
        <h1 className="text-2xl font-bold">Minhas Contas</h1>
        <button onClick={openModal} className="px-4 py-2 bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
          Adicionar conta
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
                  <button onClick={() => handleDuplicate(conta)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-4"><Folders /></button>
                  <button onClick={() => handleEdit(conta)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 mr-4"><PencilSimpleLine /></button>
                  <button onClick={() => handleDelete(conta.id)} className="text-red-600 hover:text-red-900 dark:text-red-400"><Trash /></button>
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
    const contas = await getAllContas();
    return {
      props: {
        contas,
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