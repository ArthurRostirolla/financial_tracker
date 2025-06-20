import {
  getAllDespesas,
  createDespesa,
  updateDespesa,
  deleteDespesaById
} from '../../lib/services/despesas.service';

async function handleGet(req, res) {
  try {
    const rows = await getAllDespesas();
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function handlePost(req, res) {
  try {
    await createDespesa(req.body);
    return res.status(201).json({ message: 'Despesa criada com sucesso' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query;
    await updateDespesa(id, req.body);
    return res.status(200).json({ message: 'Despesa atualizada com sucesso' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    await deleteDespesaById(id);
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