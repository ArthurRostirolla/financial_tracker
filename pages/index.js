import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import Modal from '../components/Modal';
import DespesaForm from '../components/DespesaForm';
import ReceitaForm from '../components/ReceitaForm';
import ContaForm from '../components/ContaForm';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
// Alteração aqui: trocando a função importada para o gráfico de despesas
import { getDespesasCategoriaMesAtual, getSaldoTotal, getReceitasTotalMes, getDespesasTotalMes, getGastosUltimos6Meses } from '../lib/services/reports.service';
import { getAllCategorias } from '../lib/services/categorias.service';
import { getAllContas } from '../lib/services/contas.service';
import { Wallet, TrendUp, TrendDown, PlusCircle, MinusCircle, Bank } from 'phosphor-react';

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Home({
  chartData,
  serverError,
  categorias,
  contas,
  saldoTotal,
  receitasMes,
  despesasMes,
  gastosMensaisData
}) {
  const [modalType, setModalType] = useState(null);
  const router = useRouter();

  const closeModal = () => setModalType(null);
  const refreshData = () => {
    router.replace(router.asPath);
    closeModal();
  };

  if (serverError) {
    return <Layout><p className="text-red-500 text-center p-8">{serverError}</p></Layout>;
  }

  const summaryCards = [
    { title: 'Saldo Atual', value: saldoTotal, icon: Wallet, color: saldoTotal >= 0 ? 'text-green-500' : 'text-red-500' },
    { title: 'Receitas no Mês', value: receitasMes, icon: TrendUp, color: 'text-blue-500' },
    { title: 'Despesas no Mês', value: despesasMes, icon: TrendDown, color: 'text-yellow-500' },
  ];

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8">Dashboard Principal</h1>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md flex items-center">
              <Icon size={48} className={`mr-4 ${card.color}`} />
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</h3>
                <p className={`text-2xl font-semibold ${card.color}`}>
                  R$ {card.value.toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Coluna Principal de Gráficos */}
        <div className="lg:col-span-3 space-y-8">
          <div className="p-6 bg-card-light dark:bg-card-dark rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Despesas do Mês por Categoria</h2>
            <div className="h-80 relative">
              {chartData.datasets[0].data.length > 0 ? (
                <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
              ) : (
                <p className='text-center p-8 text-gray-500'>Não há dados de despesas para exibir.</p>
              )}
            </div>
          </div>
          <div className="p-6 bg-card-light dark:bg-card-dark rounded-lg shadow-md">
             <h2 className="text-xl font-semibold mb-4">Visão Geral dos Últimos 6 Meses</h2>
             <div className="h-80 relative">
                <Bar data={gastosMensaisData} options={{ responsive: true, maintainAspectRatio: false }}/>
             </div>
          </div>
        </div>

        {/* Coluna de Ações Rápidas */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Acesso Rápido</h2>
          <div className="space-y-4">
            <button onClick={() => setModalType('receita')} className="w-full p-4 bg-card-light dark:bg-card-dark rounded-lg shadow-md flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <PlusCircle size={32} className="text-green-500 mr-4" />
                <span className="font-medium">Cadastrar Nova Receita</span>
            </button>
            <button onClick={() => setModalType('despesa')} className="w-full p-4 bg-card-light dark:bg-card-dark rounded-lg shadow-md flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <MinusCircle size={32} className="text-red-500 mr-4" />
                <span className="font-medium">Cadastrar Nova Despesa</span>
            </button>
            <button onClick={() => setModalType('conta')} className="w-full p-4 bg-card-light dark:bg-card-dark rounded-lg shadow-md flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Bank size={32} className="text-indigo-500 mr-4" />
                <span className="font-medium">Cadastrar Nova Conta</span>
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
    // Busca todos os dados em paralelo para otimizar o carregamento
    const [
      chartData,
      categorias,
      contas,
      saldoTotal,
      receitasMes,
      despesasMes,
      gastosMensaisData
    ] = await Promise.all([
      getDespesasCategoriaMesAtual(), // Alteração aqui: usando a nova função
      getAllCategorias(),
      getAllContas(),
      getSaldoTotal(),
      getReceitasTotalMes(),
      getDespesasTotalMes(),
      getGastosUltimos6Meses(),
    ]);

    return {
      props: {
        chartData,
        categorias,
        contas,
        saldoTotal,
        receitasMes,
        despesasMes,
        gastosMensaisData,
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
        saldoTotal: 0,
        receitasMes: 0,
        despesasMes: 0,
        gastosMensaisData: { labels: [], datasets: [{ data: [] }] }
      },
    };
  }
}