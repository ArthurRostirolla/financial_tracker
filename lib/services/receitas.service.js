// lib/services/receitasService.js
import pool from '../db';

/**
 * Busca todas as receitas com os nomes das categorias e contas associadas.
 * @returns {Promise<Array>} Uma lista de receitas.
 */
export async function getAllReceitas() {
  const [rows] = await pool.query(
    `SELECT r.*, c.nome AS categoria_nome, ct.nome as conta_nome
     FROM receitas r 
     LEFT JOIN categorias c ON r.categoria_id = c.id
     LEFT JOIN contas ct ON r.conta_id = ct.id
     ORDER BY data_receita DESC`
  );
  // Serializa todo o objeto para garantir que todos os tipos de data sejam convertidos para string
  return JSON.parse(JSON.stringify(rows));
}

/**
 * Cria uma nova receita.
 * @param {object} receitaData - Os dados da receita.
 * @returns {Promise<void>}
 */
export async function createReceita({ descricao, valor, categoria_id, conta_id, data_receita }) {
  await pool.query(
    'INSERT INTO receitas (descricao, valor, categoria_id, conta_id, data_receita) VALUES (?, ?, ?, ?, ?)',
    [descricao, valor, categoria_id, conta_id, data_receita]
  );
}

/**
 * Atualiza uma receita existente.
 * @param {string} id - O ID da receita.
 * @param {object} receitaData - Os dados da receita.
 * @returns {Promise<void>}
 */
export async function updateReceita(id, { descricao, valor, categoria_id, conta_id, data_receita }) {
  await pool.query(
    'UPDATE receitas SET descricao = ?, valor = ?, categoria_id = ?, conta_id = ?, data_receita = ? WHERE id = ?',
    [descricao, valor, categoria_id, conta_id, data_receita, id]
  );
}

/**
 * Exclui uma receita pelo ID.
 * @param {string} id - O ID da receita.
 * @returns {Promise<void>}
 */
export async function deleteReceitaById(id) {
  await pool.query('DELETE FROM receitas WHERE id = ?', [id]);
}