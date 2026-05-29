import { Router } from 'express';
import { getAllBookings, updateBookingStatus } from '../db/database.js';

const router = Router();

// GET /api/admin/bookings - Get all bookings
router.get('/bookings', (req, res) => {
  try {
    const bookings = getAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// PUT /api/admin/bookings/:id/status - Update booking status
router.put('/bookings/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['confirmed', 'cancelled', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Укажите корректный статус: confirmed, cancelled, completed' });
    }
    
    const booking = updateBookingStatus(req.params.id, status);
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;
