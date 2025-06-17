import pool from '../../lib/db';
export default async function handler(req, res) {
  const { method } = req;
  if (method === 'GET') {
    const [rows] = await pool.query(
      `SELECT r.*, c.nome AS categoria, ct.nome AS conta
       FROM receitas r
       LEFT JOIN categorias c ON r.categoria_id=c.id
       LEFT JOIN contas ct ON r.conta_id=ct.id
       ORDER BY data_receita DESC`
    );
    return res.status(200).json(rows);
  }
  if (method === 'POST') {
    const { descricao, valor, categoria_id, conta_id, data_receita } = req.body;
    await pool.query(
      'INSERT INTO receitas (descricao,valor,categoria_id,conta_id,data_receita) VALUES (?,?,?,?,?)',
      [descricao, valor, categoria_id, conta_id, data_receita]
    );
    return res.status(201).json({ message: 'Receita criada' });
  }
  res.setHeader('Allow',['GET','POST']).status(405).end(`Method ${method} Not Allowed`);
}