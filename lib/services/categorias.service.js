import pool from '../db';

/**
 * Busca todas as categorias.
 * @returns {Promise<Array>} Uma lista de todas as categorias.
 */
export async function getAllCategorias() {
  const [rows] = await pool.query('SELECT * FROM categorias ORDER BY nome');
  return JSON.parse(JSON.stringify(rows));
}

/**
 * Busca categorias por tipo ('receita' ou 'despesa').
 * @param {string} tipo - O tipo da categoria.
 * @returns {Promise<Array>} Uma lista de categorias filtradas por tipo.
 */
export async function getCategoriasPorTipo(tipo) {
  const [rows] = await pool.query('SELECT * FROM categorias WHERE tipo = ? ORDER BY nome', [tipo]);
  return JSON.parse(JSON.stringify(rows));
}

/**
 * Cria uma nova categoria.
 * @param {object} categoriaData - Os dados da categoria { nome, tipo }.
 * @returns {Promise<void>}
 */
export async function createCategoria({ nome, tipo }) {
  await pool.query('INSERT INTO categorias (nome, tipo) VALUES (?, ?)', [nome, tipo]);
}

/**
 * Atualiza uma categoria.
 * @param {string} id - O ID da categoria.
 * @param {object} categoriaData - Os dados da categoria { nome, tipo }.
 * @returns {Promise<void>}
 */
export async function updateCategoria(id, { nome, tipo }) {
  await pool.query('UPDATE categorias SET nome=?, tipo=? WHERE id=?', [nome, tipo, id]);
}

/**
 * Exclui uma categoria pelo ID.
 * @param {string} id - O ID da categoria.
 * @returns {Promise<void>}
 */
export async function deleteCategoriaById(id) {
  await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
}