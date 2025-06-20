// lib/services/contasService.js
import pool from '../db';

/**
 * Busca todas as contas no banco de dados.
 * @returns {Promise<Array>} Uma lista de contas.
 */
export async function getAllContas() {
  const [rows] = await pool.query('SELECT * FROM contas ORDER BY nome');
  // A serialização com JSON é uma boa prática para garantir que objetos complexos como Datas sejam tratados
  return JSON.parse(JSON.stringify(rows));
}

/**
 * Cria uma nova conta.
 * @param {object} contaData - Os dados da conta { nome, tipo, saldo_inicial }.
 * @returns {Promise<void>}
 */
export async function createConta({ nome, tipo, saldo_inicial }) {
  await pool.query(
    'INSERT INTO contas (nome, tipo, saldo_inicial) VALUES (?, ?, ?)',
    [nome, tipo, saldo_inicial]
  );
}

/**
 * Atualiza uma conta existente.
 * @param {string} id - O ID da conta a ser atualizada.
 * @param {object} contaData - Os dados da conta { nome, tipo, saldo_inicial }.
 * @returns {Promise<void>}
 */
export async function updateConta(id, { nome, tipo, saldo_inicial }) {
  await pool.query(
    'UPDATE contas SET nome = ?, tipo = ?, saldo_inicial = ? WHERE id = ?',
    [nome, tipo, saldo_inicial, id]
  );
}

/**
 * Exclui uma conta pelo ID.
 * @param {string} id - O ID da conta a ser excluída.
 * @returns {Promise<void>}
 */
export async function deleteContaById(id) {
  await pool.query('DELETE FROM contas WHERE id = ?', [id]);
}