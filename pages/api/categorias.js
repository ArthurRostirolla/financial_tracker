import {
  getAllCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoriaById
} from '../../lib/services/categorias.service';

async function handleGet(req, res) {
  try {
    const rows = await getAllCategorias();
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function handlePost(req, res) {
  try {
    await createCategoria(req.body);
    return res.status(201).json({ message: 'Categoria criada' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query; // Assumindo que o ID virá pela URL
    await updateCategoria(id, req.body);
    return res.status(200).json({ message: 'Categoria atualizada' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query; // Assumindo que o ID virá pela URL
    await deleteCategoriaById(id);
    return res.status(200).json({ message: 'Categoria excluída' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
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