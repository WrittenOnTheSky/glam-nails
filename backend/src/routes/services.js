import { Router } from 'express';
import { 
  getAllServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService 
} from '../db/database.js';

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

// POST /api/services - Create new service
router.post('/', (req, res) => {
  try {
    const { name, price, duration, description } = req.body;
    
    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Название услуги должно содержать минимум 2 символа' });
    }
    
    if (!price || price < 0) {
      return res.status(400).json({ error: 'Укажите корректную цену' });
    }
    
    if (!duration || duration < 5) {
      return res.status(400).json({ error: 'Укажите корректную длительность (минимум 5 минут)' });
    }
    
    const service = createService({ name, price, duration, description });
    res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// PUT /api/services/:id - Update service
router.put('/:id', (req, res) => {
  try {
    const { name, price, duration, description } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Название услуги должно содержать минимум 2 символа' });
    }
    
    if (price === undefined || price < 0) {
      return res.status(400).json({ error: 'Укажите корректную цену' });
    }
    
    if (!duration || duration < 5) {
      return res.status(400).json({ error: 'Укажите корректную длительность (минимум 5 минут)' });
    }
    
    const service = updateService(req.params.id, { name, price, duration, description });
    if (!service) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// DELETE /api/services/:id - Delete service
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteService(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }
    res.json({ success: true, message: 'Услуга удалена' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;
