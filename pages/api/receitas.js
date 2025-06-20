// pages/api/receitas.js
import { 
  getAllReceitas, 
  createReceita, 
  updateReceita, 
  deleteReceitaById 
} from '../../lib/services/receitas.service';

async function handleGet(req, res) {
    try {
        const rows = await getAllReceitas();
        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function handlePost(req, res) {
    try {
        await createReceita(req.body);
        return res.status(201).json({ message: 'Receita criada com sucesso' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function handlePut(req, res) {
    try {
        const { id } = req.query;
        await updateReceita(id, req.body);
        return res.status(200).json({ message: 'Receita atualizada com sucesso' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function handleDelete(req, res) {
    try {
        const { id } = req.query;
        await deleteReceitaById(id);
        return res.status(200).json({ message: 'Receita excluída com sucesso' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// O handler principal permanece o mesmo que você já tem
export default async function handler(req, res) {
    const { method } = req;
    switch (method) {
        case 'GET': return handleGet(req, res);
        case 'POST': return handlePost(req, res);
        case 'PUT': return handlePut(req, res);
        case 'DELETE': return handleDelete(req, res);
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}