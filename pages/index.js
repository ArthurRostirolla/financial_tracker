// pages/index.js
import Layout from '../components/layout';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// A função da sua página agora recebe os dados via props
export default function Home({ dadosDoGrafico }) {
  Chart.register(ArcElement, Tooltip, Legend);
  
  // O useEffect e o useState para buscar dados não são mais necessários!
  
  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-4">Despesas por Categoria</h2>
      {/* Verifica se há dados antes de tentar renderizar o gráfico */}
      {dadosDoGrafico.datasets[0].data.length > 0 ? (
        <Pie data={dadosDoGrafico} />
      ) : (
        <p>Ainda não há despesas para exibir.</p>
      )}
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