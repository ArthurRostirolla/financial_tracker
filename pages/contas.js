import Layout from '../components/layout';

// Dados de exemplo. Você deve buscar isso via getServerSideProps.
const contas = [
  { id: 1, nome: 'Carteira', tipo: 'Dinheiro', saldo_inicial: 150.75 },
  { id: 2, nome: 'Banco Principal', tipo: 'Conta Corrente', saldo_inicial: 2500.00 },
  { id: 3, nome: 'Cartão de Crédito', tipo: 'Crédito', saldo_inicial: 0 },
];

export default function ContasPage() {
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Minhas Contas</h1>
        <button className="px-4 py-2 bg-sidebar-light text-white rounded-lg shadow hover:bg-opacity-90">
          Adicionar Conta
        </button>
      </div>

      <div className="overflow-x-auto bg-card-light dark:bg-card-dark rounded-lg shadow">
        <table className="min-w-full">
          <thead className="border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Saldo Inicial</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {contas.map((conta) => (
              <tr key={conta.id}>
                <td className="px-6 py-4 whitespace-nowrap">{conta.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{conta.tipo}</td>
                <td className="px-6 py-4 whitespace-nowrap">R$ {conta.saldo_inicial.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-4">Editar</a>
                  <a href="#" className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Excluir</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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