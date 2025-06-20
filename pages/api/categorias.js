import pool from '../../lib/db';

async function handleGet(req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM categorias ORDER BY nome'
  );
  return res.status(200).json(rows);
}

async function handlePost(req, res) {
  const { nome, tipo } = req.body;
  await pool.query(
    'INSERT INTO categorias (nome,tipo) VALUES (?,?)',
    [nome, tipo]
  );
  return res.status(201).json({ message: 'Categoria criada' });
}

async function handlePut(req, res) {
  const { id, nome, tipo } = req.body;
  await pool.query(
    'UPDATE categorias SET nome=?, tipo=? WHERE id=?',
    [nome, tipo, id]
  );
  return res.status(200).json({ message: 'Categoria atualizada' });
}

async function handleDelete(req, res) {
  const { id } = req.body;
  await pool.query('DELETE FROM categorias WHERE id=?', [id]);
  return res.status(200).json({ message: 'Categoria excluída' });
}

export default async function handler(req, res) {
  const { method } = req;

  const handlers = {
    GET: handleGet,
    POST: handlePost,
    PUT: handlePut,
    DELETE: handleDelete,
  };

  const handle = handlers[method];

  if (handle) {
    return handle(req, res);
  }

  res.setHeader('Allow', Object.keys(handlers)).status(405).end(`Method ${method} Not Allowed`);
}