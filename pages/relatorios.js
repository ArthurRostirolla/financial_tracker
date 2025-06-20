import Layout from '../components/layout';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import pool from '../lib/db';
import { getSaldoTotal, getUltimaDespesa, getGastosUltimos6Meses } from '../lib/services/reports.service';

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
    const saldoTotal = await getSaldoTotal();
    const ultimaDespesa = await getUltimaDespesa();
    const gastosMensaisData = await getGastosUltimos6Meses();

    return {
      props: {
        saldoTotal,
        ultimaDespesa,
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