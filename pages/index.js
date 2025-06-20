import Layout from '../components/layout';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// Supondo que você criou esses componentes de formulário
// import DespesaForm from '../components/DespesaForm';
// import ReceitaForm from '../components/ReceitaForm';
// import ContaForm from '../components/ContaForm';


// Dados de exemplo para o gráfico. Você deve usar getServerSideProps para buscar dados reais.
const exampleChartData = {
  labels: ['Alimentação', 'Transporte', 'Moradia', 'Lazer'],
  datasets: [
    {
      label: 'Despesas do Último Mês',
      data: [1200, 500, 1800, 350],
      backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
    },
  ],
};

export default function Home() {
  Chart.register(ArcElement, Tooltip, Legend);

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Seção Principal - Dashboard */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">Dashboard Mensal</h1>
          <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow">
            <Pie data={exampleChartData} />
          </div>
        </div>

        {/* Seção de Ações Rápidas */}
        <div>
          <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-4">Ações Rápidas</h2>
          <div className="space-y-4">
            <button className="w-full p-4 text-left bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
                Cadastrar Nova Receita
            </button>
            <button className="w-full p-4 text-left bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
                Cadastrar Nova Despesa
            </button>
            <button className="w-full p-4 text-left bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
                Cadastrar Nova Conta
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}


// Essa função roda NO SERVIDOR a cada requisição
export async function getServerSideProps() {
  // A lógica de busca de dados que estava no useEffect vem para cá.
  // Como isso roda no servidor, podemos até mesmo chamar a lógica do banco diretamente,
  // mas vamos continuar usando a API por enquanto para manter a separação.
  const res = await fetch('http://localhost:3000/api/despesas'); // Use a URL completa no servidor
  const despesas = await res.json();

  const grouped = {};
  despesas.forEach(i => {
    grouped[i.categoria] = (grouped[i.categoria] || 0) + parseFloat(i.valor);
  });

  const dadosDoGrafico = {
    labels: Object.keys(grouped),
    datasets: [{ data: Object.values(grouped) }],
  };

  // O que for retornado em props, será passado para o componente da página
  return {
    props: {
      dadosDoGrafico,
    },
  };
}