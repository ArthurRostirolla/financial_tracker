import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import Modal from '../components/Modal';
import ReceitaForm from '../components/ReceitaForm'; // Vamos criar este a seguir
import pool from '../lib/db'; // Acessamos o DB diretamente no servidor

export default function ReceitasPage({ receitas, categorias, contas }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receitaToEdit, setReceitaToEdit] = useState(null);
  const router = useRouter();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setReceitaToEdit(null);
    setIsModalOpen(false);
  };

  const handleEdit = (receita) => {
    setReceitaToEdit(receita);
    openModal();
  };
  
  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      await fetch(`/api/receitas`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      router.replace(router.asPath); // Recarrega os dados
    }
  };

  const refreshData = () => {
    router.replace(router.asPath);
    closeModal();
  };

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
             {/* Cabeçalho da tabela */}
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {receitas.map((receita) => (
              <tr key={receita.id}>
                <td className="px-6 py-4">{receita.descricao}</td>
                <td className="px-6 py-4 text-green-600 dark:text-green-400">R$ {parseFloat(receita.valor).toFixed(2)}</td>
                <td className="px-6 py-4">{receita.categoria || '-'}</td>
                <td className="px-6 py-4">{new Date(receita.data_receita).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(receita)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 mr-4">Editar</button>
                  <button onClick={() => handleDelete(receita.id)} className="text-red-600 hover:text-red-900 dark:text-red-400">Excluir</button>
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
  // Buscamos todos os dados necessários no servidor de uma vez
  const [receitas] = await pool.query(
    `SELECT r.*, c.nome AS categoria FROM receitas r LEFT JOIN categorias c ON r.categoria_id=c.id ORDER BY data_receita DESC`
  );
  const [categorias] = await pool.query('SELECT * FROM categorias WHERE tipo="receita" ORDER BY nome');
  const [contas] = await pool.query('SELECT * FROM contas ORDER BY nome');

  // Convertemos dados que não são serializáveis (como Datas) para strings
  const serializableReceitas = receitas.map(r => ({
    ...r,
    data_receita: r.data_receita.toISOString().split('T')[0], // Formato YYYY-MM-DD
  }));

  return {
    props: {
      receitas: serializableReceitas,
      categorias,
      contas,
    },
  };
}