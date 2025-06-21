// pages/relatorios.js
import { useState, useEffect } from 'react';
import Layout from '../components/layout';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import {
  getAccountBalances,
  getMonthlyRevenueVsExpense,
  getReceitasCategoriaMesAtual,
  getDespesasCategoriaMesAtual,
} from '../lib/services/reports.service';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Sub-componente para os relatórios com gráficos
const GraficosView = ({ accountBalancesData, monthlyRevenueVsExpenseData, receitasCategoriaData, despesasCategoriaData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Receitas vs. Despesas (Últimos 6 Meses)</h2>
      <div className="h-80 relative">
        <Bar data={monthlyRevenueVsExpenseData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Saldo Atual por Conta</h2>
      <div className="h-80 relative">
         <Bar data={accountBalancesData} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' }} />
      </div>
    </div>
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Receitas do Mês por Categoria</h2>
      <div className="h-80 relative">
        {receitasCategoriaData.datasets[0].data.length > 0 ? (
          <Doughnut data={receitasCategoriaData} options={{ responsive: true, maintainAspectRatio: false }} />
        ) : (
          <p className="text-center p-8 text-gray-500">Sem receitas no mês atual.</p>
        )}
      </div>
    </div>
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Despesas do Mês por Categoria</h2>
      <div className="h-80 relative">
        {despesasCategoriaData.datasets[0].data.length > 0 ? (
          <Pie data={despesasCategoriaData} options={{ responsive: true, maintainAspectRatio: false }} />
        ) : (
          <p className="text-center p-8 text-gray-500">Sem despesas no mês atual.</p>
        )}
      </div>
    </div>
  </div>
);

// Sub-componente para o extrato
const ExtratoView = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Define o período padrão como os últimos 30 dias
  const today = new Date();
  const priorDate = new Date(new Date().setDate(today.getDate() - 30));
  const [startDate, setStartDate] = useState(priorDate.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/relatorios/extrato?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error('Falha ao buscar dados');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Busca os dados na montagem inicial do componente
  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  return (
    <div>
      <div className="bg-card-light dark:bg-card-dark p-4 rounded-lg shadow mb-6">
        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4 items-center">
            <div className='flex-1'>
                <label htmlFor="startDate" className="block text-sm font-medium">Data de Início</label>
                <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600"/>
            </div>
            <div className='flex-1'>
                <label htmlFor="endDate" className="block text-sm font-medium">Data de Fim</label>
                <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600"/>
            </div>
            <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-2 bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90 self-end">
                {loading ? 'Buscando...' : 'Filtrar'}
            </button>
        </form>
      </div>

      {loading ? (
        <p className="text-center p-8">Carregando...</p>
      ) : (
        <div className="overflow-x-auto bg-card-light dark:bg-card-dark rounded-lg shadow">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Conta</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.length > 0 ? transactions.map((t) => (
                <tr key={`${t.tipo}-${t.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.descricao}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.conta_nome || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      t.tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right ${
                    t.tipo === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    R$ {parseFloat(t.valor).toFixed(2)}
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">Nenhuma transação encontrada para o período.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


export default function RelatoriosPage({ serverError, chartDataProps }) {
  const [activeTab, setActiveTab] = useState('graficos');

  if (serverError) {
    return <Layout><p className="text-red-500 text-center">{serverError}</p></Layout>;
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="border-b border-gray-200 dark:border-gray-700 mt-4">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('graficos')}
                    className={`${activeTab === 'graficos' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    Relatórios Gráficos
                </button>
                <button
                    onClick={() => setActiveTab('extrato')}
                    className={`${activeTab === 'extrato' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    Extrato por Período
                </button>
            </nav>
        </div>
      </div>
      
      {activeTab === 'graficos' && <GraficosView {...chartDataProps} />}
      {activeTab === 'extrato' && <ExtratoView />}

    </Layout>
  );
}


export async function getServerSideProps() {
  try {
    const [
      accountBalancesData,
      monthlyRevenueVsExpenseData,
      receitasCategoriaData,
      despesasCategoriaData
    ] = await Promise.all([
      getAccountBalances(),
      getMonthlyRevenueVsExpense(),
      getReceitasCategoriaMesAtual(),
      getDespesasCategoriaMesAtual()
    ]);

    return {
      props: {
        chartDataProps: {
          accountBalancesData,
          monthlyRevenueVsExpenseData,
          receitasCategoriaData,
          despesasCategoriaData
        },
      }
    };

  } catch (error) {
    console.error("Erro no getServerSideProps de Relatórios:", error);
    const emptyChartData = { labels: [], datasets: [{ data: [] }] };
    return {
      props: {
        serverError: 'Não foi possível conectar ao banco de dados e gerar relatórios.',
        chartDataProps: {
            accountBalancesData: emptyChartData,
            monthlyRevenueVsExpenseData: emptyChartData,
            receitasCategoriaData: emptyChartData,
            despesasCategoriaData: emptyChartData
        }
      },
    };
  }
}