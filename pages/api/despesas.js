import pool from '../../lib/db';

async function handleGet(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, c.nome AS categoria_nome, ct.nome AS conta_nome
       FROM despesas d
       LEFT JOIN categorias c ON d.categoria_id = c.id
       LEFT JOIN contas ct ON d.conta_id = ct.id
       ORDER BY data_despesa DESC`
    );
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function handlePost(req, res) {
  try {
    const { descricao, valor, categoria_id, conta_id, data_despesa } = req.body;
    await pool.query(
      'INSERT INTO despesas (descricao, valor, categoria_id, conta_id, data_despesa) VALUES (?, ?, ?, ?, ?)',
      [descricao, valor, categoria_id, conta_id, data_despesa]
    );
    return res.status(201).json({ message: 'Despesa criada com sucesso' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const { descricao, valor, categoria_id, conta_id, data_despesa } = req.body;
    await pool.query(
      'UPDATE despesas SET descricao = ?, valor = ?, categoria_id = ?, conta_id = ?, data_despesa = ? WHERE id = ?',
      [descricao, valor, categoria_id, conta_id, data_despesa, id]
    );
    return res.status(200).json({ message: 'Despesa atualizada com sucesso' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    await pool.query('DELETE FROM despesas WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Despesa excluída com sucesso' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export default async function handler(req, res) {
  const { method } = req;
  switch (method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}