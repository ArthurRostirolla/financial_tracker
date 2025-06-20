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
    const [despesas] = await pool.query(`
      SELECT c.nome as categoria, d.valor 
      FROM despesas d 
      JOIN categorias c ON d.categoria_id = c.id
      WHERE d.data_despesa >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `);

    const [categorias] = await pool.query('SELECT * FROM categorias ORDER BY nome');
    const [contas] = await pool.query('SELECT * FROM contas ORDER BY nome');

    const grouped = {};
    despesas.forEach(d => {
      grouped[d.categoria] = (grouped[d.categoria] || 0) + parseFloat(d.valor);
    });

    const backgroundColors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'];

    const chartData = {
      labels: Object.keys(grouped),
      datasets: [{
        label: 'Despesas do Último Mês',
        data: Object.values(grouped),
        backgroundColor: backgroundColors.slice(0, Object.keys(grouped).length),
      }],
    };

    return {
      props: {
        chartData,
        // CORREÇÃO: Serializando os dados para evitar o erro de Date object.
        categorias: JSON.parse(JSON.stringify(categorias)),
        contas: JSON.parse(JSON.stringify(contas)),
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