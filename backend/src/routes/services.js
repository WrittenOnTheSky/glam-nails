import { Router } from 'express';
import { getAllServices, getServiceById, getServicesByCategory } from '../db/database.js';

const router = Router();

// GET /api/services - List all services
router.get('/', (req, res) => {
  try {
    const services = getAllServices();
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// GET /api/services/grouped - List services grouped by category
router.get('/grouped', (req, res) => {
  try {
    const grouped = getServicesByCategory();
    res.json(grouped);
  } catch (error) {
    console.error('Error fetching grouped services:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// GET /api/services/:id - Get service by ID
router.get('/:id', (req, res) => {
  try {
    const service = getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;
