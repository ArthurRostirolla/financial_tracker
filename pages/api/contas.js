import pool from '../../lib/db';
export default async function handler(req, res) {
  const { method } = req;
  if (method === 'GET') {
    const [rows] = await pool.query(
      'SELECT * FROM contas ORDER BY nome'
    );
    return res.status(200).json(rows);
  }
  if (method === 'POST') {
    const { nome, tipo, saldo_inicial } = req.body;
    await pool.query(
      'INSERT INTO contas (nome,tipo,saldo_inicial) VALUES (?,?,?)',
      [nome, tipo, saldo_inicial]
    );
    return res.status(201).json({ message: 'Conta criada' });
  }
  if (method === 'PUT') {
    const { id, nome, tipo, saldo_inicial } = req.body;
    await pool.query(
      'UPDATE contas SET nome=?, tipo=?, saldo_inicial=? WHERE id=?',
      [nome, tipo, saldo_inicial, id]
    );
    return res.status(200).json({ message: 'Conta atualizada' });
  }
  if (method === 'DELETE') {
    const { id } = req.body;
    await pool.query('DELETE FROM contas WHERE id=?', [id]);
    return res.status(200).json({ message: 'Conta excluída' });
  }
  res.setHeader('Allow',['GET','POST','PUT','DELETE']).status(405).end(`Method ${method} Not Allowed`);
}