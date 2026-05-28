import { Router } from 'express';
import { getAvailableSlots } from '../db/database.js';

const router = Router();

// Helper to validate date format YYYY-MM-DD
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// GET /api/available-slots - Get available time slots for a date
router.get('/', (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Необходимо указать дату' });
    }
    
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'Неверный формат даты. Используйте YYYY-MM-DD' });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const requestedDate = new Date(date);
    if (requestedDate < today) {
      return res.status(400).json({ error: 'Нельзя бронировать на прошлую дату' });
    }
    
    const slots = getAvailableSlots(date);
    res.json({ date, slots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;
