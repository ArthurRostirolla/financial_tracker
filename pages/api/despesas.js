// pages/api/despesas.js
import pool from '../../lib/db';

// Função específica para o método GET
async function handleGet(req, res) {
  const [rows] = await pool.query(
    `SELECT d.*, c.nome AS categoria, ct.nome AS conta
     FROM despesas d
     LEFT JOIN categorias c ON d.categoria_id=c.id
     LEFT JOIN contas ct ON d.conta_id=ct.id
     ORDER BY data_despesa DESC`
  );
  return res.status(200).json(rows);
}

// Função específica para o método POST
async function handlePost(req, res) {
  const { descricao, valor, categoria_id, conta_id, data_despesa } = req.body;
  await pool.query(
    'INSERT INTO despesas (descricao,valor,categoria_id,conta_id,data_despesa) VALUES (?,?,?,?,?)',
    [descricao, valor, categoria_id, conta_id, data_despesa]
  );
  return res.status(201).json({ message: 'Criado' });
}

// Handler principal que delega para a função correta
export default async function handler(req, res) {
  const { method } = req;

  // Mapeia o método HTTP para a função correspondente
  const handlers = {
    GET: handleGet,
    POST: handlePost,
  };

  const handle = handlers[method];

  if (handle) {
    return handle(req, res);
  }

  res.setHeader('Allow', Object.keys(handlers)).status(405).end(`Method ${method} Not Allowed`);
}