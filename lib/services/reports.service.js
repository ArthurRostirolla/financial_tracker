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
 * Agrega as despesas do último mês por categoria para o gráfico de pizza.
 * @returns {Promise<object>} Os dados formatados para o Chart.js.
 */
export async function getDespesasAgrupadasUltimoMes() {
  const [despesas] = await pool.query(`
    SELECT c.nome as categoria, d.valor 
    FROM despesas d 
    JOIN categorias c ON d.categoria_id = c.id
    WHERE d.data_despesa >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
  `);

  const grouped = {};
  despesas.forEach(d => {
    grouped[d.categoria] = (grouped[d.categoria] || 0) + parseFloat(d.valor);
  });

  const backgroundColors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40', '#c9cbcf'];

  return {
    labels: Object.keys(grouped),
    datasets: [{
      label: 'Despesas do Último Mês',
      data: Object.values(grouped),
      backgroundColor: backgroundColors.slice(0, Object.keys(grouped).length),
    }],
  };
}