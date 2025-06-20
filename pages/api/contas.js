import pool from '../../lib/db';

async function handleGet(req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM contas ORDER BY nome'
  );
  return res.status(200).json(rows);
}

async function handlePost(req, res) {
  const { nome, tipo, saldo_inicial } = req.body;
  await pool.query(
    'INSERT INTO contas (nome,tipo,saldo_inicial) VALUES (?,?,?)',
    [nome, tipo, saldo_inicial]
  );
  return res.status(201).json({ message: 'Conta criada' });
}

async function handlePut(req, res) {
  const { id, nome, tipo, saldo_inicial } = req.body;
  await pool.query(
    'UPDATE contas SET nome=?, tipo=?, saldo_inicial=? WHERE id=?',
    [nome, tipo, saldo_inicial, id]
  );
  return res.status(200).json({ message: 'Conta atualizada' });
}

async function handleDelete(req, res) {
  const { id } = req.body;
  await pool.query('DELETE FROM contas WHERE id=?', [id]);
  return res.status(200).json({ message: 'Conta excluída' });
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