import Layout from '../components/layout';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import pool from '../lib/db';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RelatoriosPage({ serverError, saldoTotal, ultimaDespesa, gastosMensaisData }) {
  
  if (serverError) {
    return <Layout><p className="text-red-500">{serverError}</p></Layout>;
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Relatórios Financeiros</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Atual Total</h3>
          <p className={`mt-1 text-3xl font-semibold ${saldoTotal >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            R$ {saldoTotal.toFixed(2)}
          </p>
        </div>
        {ultimaDespesa && (
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Última Despesa</h3>
            <p className="mt-1 text-xl font-semibold truncate">{ultimaDespesa.descricao}</p>
            <p className="text-red-500">- R$ {parseFloat(ultimaDespesa.valor).toFixed(2)}</p>
          </div>
        )}
      </div>

      <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Gastos nos Últimos 6 Meses</h2>
        <Bar data={gastosMensaisData} options={{ responsive: true }}/>
      </div>
    </Layout>
  );
}


export async function getServerSideProps() {
  try {
    // 1. Saldo Total
    const [saldos] = await pool.query(`
      SELECT 
        (SELECT SUM(saldo_inicial) FROM contas) + 
        (SELECT SUM(valor) FROM receitas) - 
        (SELECT SUM(valor) FROM despesas) as saldo
    `);
    const saldoTotal = saldos[0].saldo || 0;

    // 2. Última despesa
    const [despesas] = await pool.query('SELECT * FROM despesas ORDER BY data_despesa DESC, id DESC LIMIT 1');
    const ultimaDespesa = despesas[0] || null;

    // 3. Gastos Mensais
    const [gastos] = await pool.query(`
      SELECT DATE_FORMAT(data_despesa, '%Y-%m') as mes, SUM(valor) as total
      FROM despesas
      WHERE data_despesa >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY mes
      ORDER BY mes ASC
    `);

    const labels = [];
    const data = [];
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    gastos.forEach(g => {
      const [year, month] = g.mes.split('-');
      labels.push(`${monthNames[parseInt(month) - 1]}/${year.slice(2)}`);
      data.push(g.total);
    });

    const gastosMensaisData = {
      labels,
      datasets: [{
        label: 'Gastos por Mês',
        data,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }],
    };

    return {
      props: {
        saldoTotal: parseFloat(saldoTotal),
        ultimaDespesa: ultimaDespesa ? JSON.parse(JSON.stringify(ultimaDespesa)) : null,
        gastosMensaisData,
      }
    };

  } catch (error) {
    console.error("Erro no getServerSideProps de Relatórios:", error);
    return {
      props: {
        serverError: 'Não foi possível conectar ao banco de dados e gerar relatórios.',
        saldoTotal: 0,
        ultimaDespesa: null,
        gastosMensaisData: { labels: [], datasets: [{ data: [] }] },
      },
    };
  }
}