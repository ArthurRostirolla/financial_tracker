// lib/services/reports.service.js
import pool from '../db';

/**
 * Calcula o saldo total de todas as contas, receitas e despesas.
 * @returns {Promise<number>} O saldo total.
 */
export async function getSaldoTotal() {
  const [saldos] = await pool.query(`
    SELECT 
      (SELECT COALESCE(SUM(saldo_inicial), 0) FROM contas) + 
      (SELECT COALESCE(SUM(valor), 0) FROM receitas) - 
      (SELECT COALESCE(SUM(valor), 0) FROM despesas) as saldo
  `);
  return parseFloat(saldos[0].saldo || 0);
}

/**
 * Calcula o total de receitas no mês atual.
 * @returns {Promise<number>} O total de receitas.
 */
export async function getReceitasTotalMes() {
  const [rows] = await pool.query(`
    SELECT COALESCE(SUM(valor), 0) as total
    FROM receitas
    WHERE MONTH(data_receita) = MONTH(CURDATE()) AND YEAR(data_receita) = YEAR(CURDATE())
  `);
  return parseFloat(rows[0].total || 0);
}

/**
 * Calcula o total de despesas no mês atual.
 * @returns {Promise<number>} O total de despesas.
 */
export async function getDespesasTotalMes() {
  const [rows] = await pool.query(`
    SELECT COALESCE(SUM(valor), 0) as total
    FROM despesas
    WHERE MONTH(data_despesa) = MONTH(CURDATE()) AND YEAR(data_despesa) = YEAR(CURDATE())
  `);
  return parseFloat(rows[0].total || 0);
}

/**
 * Busca a última despesa registrada.
 * @returns {Promise<object|null>} A última despesa ou null se não houver nenhuma.
 */
export async function getUltimaDespesa() {
  const [despesas] = await pool.query('SELECT * FROM despesas ORDER BY data_despesa DESC, id DESC LIMIT 1');
  return despesas[0] ? JSON.parse(JSON.stringify(despesas[0])) : null;
}

/**
 * Agrega os gastos dos últimos 6 meses para o gráfico.
 * @returns {Promise<object>} Os dados formatados para o Chart.js.
 */
export async function getGastosUltimos6Meses() {
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

  return {
    labels,
    datasets: [{
      label: 'Gastos por Mês',
      data,
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgb(255, 99, 132)',
      borderWidth: 1
    }],
  };
}

/**
 * Busca transações (receitas e despesas) em um intervalo de datas.
 * @param {string} startDate - Data de início (YYYY-MM-DD).
 * @param {string} endDate - Data de fim (YYYY-MM-DD).
 * @returns {Promise<Array>} Uma lista de transações.
 */
export async function getTransactionsByDateRange(startDate, endDate) {
  const query = `
    (SELECT 
      'receita' as tipo,
      id,
      descricao,
      valor,
      data_receita as data,
      (SELECT nome FROM contas WHERE id = conta_id) as conta_nome
    FROM receitas
    WHERE data_receita BETWEEN ? AND ?)
    UNION ALL
    (SELECT
      'despesa' as tipo,
      id,
      descricao,
      valor,
      data_despesa as data,
      (SELECT nome FROM contas WHERE id = conta_id) as conta_nome
    FROM despesas
    WHERE data_despesa BETWEEN ? AND ?)
    ORDER BY data DESC;
  `;
  const [rows] = await pool.query(query, [startDate, endDate, startDate, endDate]);
  return JSON.parse(JSON.stringify(rows));
}

/**
 * Agrega as receitas e despesas dos últimos 6 meses para um gráfico de barras.
 * @returns {Promise<object>} Os dados formatados para o Chart.js.
 */
export async function getMonthlyRevenueVsExpense() {
  const [data] = await pool.query(`
    SELECT 
      mes,
      SUM(CASE WHEN tipo = 'receita' THEN total ELSE 0 END) as receitas,
      SUM(CASE WHEN tipo = 'despesa' THEN total ELSE 0 END) as despesas
    FROM (
      SELECT DATE_FORMAT(data_receita, '%Y-%m') as mes, SUM(valor) as total, 'receita' as tipo
      FROM receitas
      WHERE data_receita >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY mes
      UNION ALL
      SELECT DATE_FORMAT(data_despesa, '%Y-%m') as mes, SUM(valor) as total, 'despesa' as tipo
      FROM despesas
      WHERE data_despesa >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY mes
    ) as combined
    GROUP BY mes
    ORDER BY mes ASC;
  `);

  const labels = [];
  const receitasData = [];
  const despesasData = [];
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  data.forEach(item => {
    const [year, month] = item.mes.split('-');
    labels.push(`${monthNames[parseInt(month) - 1]}/${year.slice(2)}`);
    receitasData.push(item.receitas);
    despesasData.push(item.despesas);
  });
  
  return {
    labels,
    datasets: [
      {
        label: 'Receitas',
        data: receitasData,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
      {
        label: 'Despesas',
        data: despesasData,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
    ],
  };
}

/**
 * Busca o balanço atual de cada conta.
 * @returns {Promise<object>} Os dados formatados para o Chart.js.
 */
export async function getAccountBalances() {
  const [contas] = await pool.query(`
    SELECT
      c.nome,
      c.saldo_inicial + COALESCE(SUM(r.valor), 0) - COALESCE((
        SELECT SUM(d.valor) 
        FROM despesas d 
        WHERE d.conta_id = c.id
      ), 0) as saldo_atual
    FROM contas c
    LEFT JOIN receitas r ON c.id = r.conta_id
    GROUP BY c.id, c.nome, c.saldo_inicial
    ORDER BY saldo_atual DESC;
  `);
  
  const labels = [];
  const data = [];
  
  contas.forEach(conta => {
    labels.push(conta.nome);
    data.push(parseFloat(conta.saldo_atual));
  });

  return {
    labels,
    datasets: [{
      label: 'Saldo por Conta',
      data,
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)'
      ],
      borderWidth: 1
    }]
  };
}


/**
 * Agrega as despesas do mês atual por categoria para o gráfico de pizza.
 * @returns {Promise<object>} Os dados formatados para o Chart.js.
 */
export async function getDespesasCategoriaMesAtual() {
    const [despesas] = await pool.query(`
      SELECT c.nome as categoria, SUM(d.valor) as total
      FROM despesas d 
      JOIN categorias c ON d.categoria_id = c.id
      WHERE MONTH(d.data_despesa) = MONTH(CURDATE()) AND YEAR(d.data_despesa) = YEAR(CURDATE())
      GROUP BY c.nome
      ORDER BY total DESC
    `);
  
    const labels = despesas.map(d => d.categoria);
    const data = despesas.map(d => d.total);
    const backgroundColors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40', '#c9cbcf', '#ffb3ba', '#bae1ff', '#ffffba'];
  
    return {
      labels,
      datasets: [{
        label: 'Despesas por Categoria (Mês Atual)',
        data,
        backgroundColor: backgroundColors.slice(0, labels.length),
      }],
    };
}

/**
 * Agrega as receitas do mês atual por categoria para o gráfico de pizza.
 * @returns {Promise<object>} Os dados formatados para o Chart.js.
 */
export async function getReceitasCategoriaMesAtual() {
    const [receitas] = await pool.query(`
      SELECT c.nome as categoria, SUM(r.valor) as total
      FROM receitas r
      JOIN categorias c ON r.categoria_id = c.id
      WHERE MONTH(r.data_receita) = MONTH(CURDATE()) AND YEAR(r.data_receita) = YEAR(CURDATE())
      GROUP BY c.nome
      ORDER BY total DESC
    `);
  
    const labels = receitas.map(r => r.categoria);
    const data = receitas.map(r => r.total);
    const backgroundColors = ['#4bc0c0', '#9966ff', '#ff9f40', '#c9cbcf', '#ff6384', '#36a2eb', '#ffce56'];
  
    return {
      labels,
      datasets: [{
        label: 'Receitas por Categoria (Mês Atual)',
        data,
        backgroundColor: backgroundColors.slice(0, labels.length),
      }],
    };
}