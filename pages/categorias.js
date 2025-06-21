import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import Modal from '../components/Modal';
import CategoriaForm from '../components/CategoriaForm';
import { getAllCategorias } from '../lib/services/categorias.service';
import { PencilSimpleLine, Trash } from 'phosphor-react';

export default function CategoriasPage({ categorias, serverError }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = useState(null);
  const router = useRouter();

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setCategoriaToEdit(null);
    setIsModalOpen(false);
  };

  const refreshData = () => {
    router.replace(router.asPath);
    closeModal();
  };

  const handleEdit = (categoria) => {
    setCategoriaToEdit(categoria);
    openModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      const response = await fetch(`/api/categorias?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        refreshData();
      } else {
        alert('Falha ao excluir a categoria.');
      }
    }
  };

  if (serverError) {
    return <Layout><p className="text-red-500">{serverError}</p></Layout>;
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Categorias</h1>
        <button onClick={openModal} className="px-4 py-2 bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
          Adicionar Categoria
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={categoriaToEdit ? 'Editar Categoria' : 'Nova Categoria'}>
        <CategoriaForm
          onSuccess={refreshData}
          categoriaToEdit={categoriaToEdit}
        />
      </Modal>

      <div className="overflow-x-auto bg-card-light dark:bg-card-dark rounded-lg shadow">
        <table className="min-w-full">
          <thead className="border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td className="px-6 py-4 whitespace-nowrap">{categoria.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      categoria.tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {categoria.tipo.charAt(0).toUpperCase() + categoria.tipo.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(categoria)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 mr-4"><PencilSimpleLine /></button>
                  <button onClick={() => handleDelete(categoria.id)} className="text-red-600 hover:text-red-900 dark:text-red-400"><Trash /></button>
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
    const categorias = await getAllCategorias();
    return {
      props: {
        categorias,
      },
    };
  } catch (error) {
    console.error("Erro no getServerSideProps de Categorias:", error);
    return {
      props: {
        serverError: 'Não foi possível conectar ao banco de dados.',
        categorias: []
      },
    };
  }
}