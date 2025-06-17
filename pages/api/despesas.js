import pool from '../../lib/db';
export default async function handler(req, res) {
  const { method } = req;
  if (method === 'GET') {
    const [rows] = await pool.query(
      `SELECT d.*, c.nome AS categoria, ct.nome AS conta
       FROM despesas d
       LEFT JOIN categorias c ON d.categoria_id=c.id
       LEFT JOIN contas ct ON d.conta_id=ct.id
       ORDER BY data_despesa DESC`
    );
    return res.status(200).json(rows);
  }
  if (method === 'POST') {
    const { descricao, valor, categoria_id, conta_id, data_despesa } = req.body;
    await pool.query(
      'INSERT INTO despesas (descricao,valor,categoria_id,conta_id,data_despesa) VALUES (?,?,?,?,?)',
      [descricao, valor, categoria_id, conta_id, data_despesa]
    );
    return res.status(201).json({ message: 'Criado' });
  }
  res.setHeader('Allow',['GET','POST']).status(405).end(`Method ${method} Not Allowed`);
}