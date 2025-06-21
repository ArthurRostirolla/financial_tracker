// pages/api/relatorios/extrato.js
import { getTransactionsByDateRange } from '../../../lib/services/reports.service';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'As datas de início e fim são obrigatórias.' });
  }

  try {
    const transactions = await getTransactionsByDateRange(startDate, endDate);
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('API Error fetching transactions:', error);
    return res.status(500).json({ message: 'Erro ao buscar transações.' });
  }
}