import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import Modal from '../components/Modal';
import DespesaForm from '../components/DespesaForm';
import ReceitaForm from '../components/ReceitaForm';
import ContaForm from '../components/ContaForm';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import pool from '../lib/db';
import { getDespesasAgrupadasUltimoMes } from '../lib/services/reports.service';
import { getAllCategorias } from '../lib/services/categorias.service';
import { getAllContas } from '../lib/services/contas.service';

Chart.register(ArcElement, Tooltip, Legend);

export default function Home({ chartData, serverError, categorias, contas }) {
  const [modalType, setModalType] = useState(null); // 'despesa', 'receita', 'conta'
  const router = useRouter();

  const closeModal = () => setModalType(null);
  const refreshData = () => {
    router.replace(router.asPath);
    closeModal();
  };

  if (serverError) {
    return <Layout><p className="text-red-500">{serverError}</p></Layout>;
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-4">Dashboard Mensal</h1>
          <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow">
            {chartData.datasets[0].data.length > 0 ? (
              <Pie data={chartData} options={{ responsive: true }} />
            ) : (
              <p className='text-center p-8'>Não há dados de despesas para exibir.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
          <div className="space-y-4">
            <button onClick={() => setModalType('receita')} className="w-full p-4 text-left bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
                Cadastrar Nova Receita
            </button>
            <button onClick={() => setModalType('despesa')} className="w-full p-4 text-left bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
                Cadastrar Nova Despesa
            </button>
            <button onClick={() => setModalType('conta')} className="w-full p-4 text-left bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
                Cadastrar Nova Conta
            </button>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <Modal isOpen={modalType === 'despesa'} onClose={closeModal} title="Nova Despesa">
        <DespesaForm onSuccess={refreshData} categorias={categorias.filter(c => c.tipo === 'despesa')} contas={contas} />
      </Modal>
      <Modal isOpen={modalType === 'receita'} onClose={closeModal} title="Nova Receita">
        <ReceitaForm onSuccess={refreshData} categorias={categorias.filter(c => c.tipo === 'receita')} contas={contas} />
      </Modal>
      <Modal isOpen={modalType === 'conta'} onClose={closeModal} title="Nova Conta">
        <ContaForm onSuccess={refreshData} />
      </Modal>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const chartData = await getDespesasAgrupadasUltimoMes();
    const categorias = await getAllCategorias();
    const contas = await getAllContas();

    return {
      props: {
        chartData,
        categorias,
        contas,
      },
    };
  } catch (error) {
    console.error("Erro no getServerSideProps da Home:", error);
    return {
      props: {
        serverError: 'Não foi possível conectar ao banco de dados.',
        chartData: { labels: [], datasets: [{ data: [] }] },
        categorias: [],
        contas: [],
      },
    };
  }
}