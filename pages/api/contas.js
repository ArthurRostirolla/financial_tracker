// pages/api/contas.js
import { getAllContas, createConta, updateConta, deleteContaById } from '../../lib/services/contas.service';

async function handleGet(req, res) {
  try {
    const contas = await getAllContas();
    return res.status(200).json(contas);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function handlePost(req, res) {
  try {
    await createConta(req.body);
    return res.status(201).json({ message: 'Conta criada com sucesso' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query; // Pega o ID da query string
    await updateConta(id, req.body);
    return res.status(200).json({ message: 'Conta atualizada com sucesso' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query; // Pega o ID da query string
    await deleteContaById(id);
    return res.status(200).json({ message: 'Conta excluída com sucesso' });
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
      // No seu formulário, você já passa o ID na URL para PUT.
      // Ex: /api/contas?id=CONTA_ID
      // A correção para DELETE também deve usar req.query
      return handlePut(req, res); 
    case 'DELETE':
      return handleDelete(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}