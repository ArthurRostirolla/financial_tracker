import Layout from '../components/layout';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Dados de exemplo que você obteria processando suas despesas e receitas
const saldoTotal = 5430.50;
const ultimaDespesa = { descricao: 'Supermercado', valor: 254.78 };

const gastosMensaisData = {
  labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
  datasets: [{
    label: 'Gastos por Mês',
    data: [1800, 1950, 2200, 2100, 2500, 2340],
    backgroundColor: 'rgba(255, 99, 132, 0.5)',
  }],
};

export default function RelatoriosPage() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Relatórios Financeiros</h1>
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Atual</h3>
          <p className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">R$ {saldoTotal.toFixed(2)}</p>
        </div>
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Última Despesa</h3>
          <p className="mt-1 text-xl font-semibold">{ultimaDespesa.descricao}</p>
          <p className="text-red-500">- R$ {ultimaDespesa.valor.toFixed(2)}</p>
        </div>
        {/* Adicione outros cards aqui, como "Receita do Mês", "Despesa do Mês" */}
      </div>

      {/* Gráfico Principal */}
      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Análise Mensal</h2>
        <Bar data={gastosMensaisData} />
      </div>

      {/* Outros relatórios podem ser adicionados aqui */}

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