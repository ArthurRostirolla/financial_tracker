import pool from '../db';

/**
 * Busca todas as despesas com os nomes das categorias e contas associadas.
 * @returns {Promise<Array>} Uma lista de despesas.
 */
export async function getAllDespesas() {
  const [rows] = await pool.query(
    `SELECT d.*, c.nome AS categoria_nome, ct.nome as conta_nome 
     FROM despesas d 
     LEFT JOIN categorias c ON d.categoria_id = c.id
     LEFT JOIN contas ct ON d.conta_id = ct.id
     ORDER BY data_despesa DESC`
  );
  // Serializa todo o objeto para garantir que todos os tipos de data sejam convertidos para string
  return JSON.parse(JSON.stringify(rows));
}

/**
 * Cria uma nova despesa.
 * @param {object} despesaData - Os dados da despesa.
 * @returns {Promise<void>}
 */
export async function createDespesa({ descricao, valor, categoria_id, conta_id, data_despesa }) {
  await pool.query(
    'INSERT INTO despesas (descricao, valor, categoria_id, conta_id, data_despesa) VALUES (?, ?, ?, ?, ?)',
    [descricao, valor, categoria_id, conta_id, data_despesa]
  );
}

/**
 * Atualiza uma despesa existente.
 * @param {string} id - O ID da despesa.
 * @param {object} despesaData - Os dados da despesa.
 * @returns {Promise<void>}
 */
export async function updateDespesa(id, { descricao, valor, categoria_id, conta_id, data_despesa }) {
  await pool.query(
    'UPDATE despesas SET descricao = ?, valor = ?, categoria_id = ?, conta_id = ?, data_despesa = ? WHERE id = ?',
    [descricao, valor, categoria_id, conta_id, data_despesa, id]
  );
}

/**
 * Exclui uma despesa pelo ID.
 * @param {string} id - O ID da despesa.
 * @returns {Promise<void>}
 */
export async function deleteDespesaById(id) {
  await pool.query('DELETE FROM despesas WHERE id = ?', [id]);
}