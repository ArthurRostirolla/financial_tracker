import pool from '../../lib/db';
export default async function handler(req, res) {
  const { method } = req;
  if (method === 'GET') {
    const [rows] = await pool.query(
      'SELECT * FROM categorias ORDER BY nome'
    );
    return res.status(200).json(rows);
  }
  if (method === 'POST') {
    const { nome, tipo } = req.body;
    await pool.query(
      'INSERT INTO categorias (nome,tipo) VALUES (?,?)',
      [nome, tipo]
    );
    return res.status(201).json({ message: 'Categoria criada' });
  }
  if (method === 'PUT') {
    const { id, nome, tipo } = req.body;
    await pool.query(
      'UPDATE categorias SET nome=?, tipo=? WHERE id=?',
      [nome, tipo, id]
    );
    return res.status(200).json({ message: 'Categoria atualizada' });
  }
  if (method === 'DELETE') {
    const { id } = req.body;
    await pool.query('DELETE FROM categorias WHERE id=?', [id]);
    return res.status(200).json({ message: 'Categoria excluída' });
  }
  res.setHeader('Allow',['GET','POST','PUT','DELETE']).status(405).end(`Method ${method} Not Allowed`);
}