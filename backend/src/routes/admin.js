import { Router } from 'express';
import { getAllBookings, updateBookingStatus, getBookingById } from '../db/database.js';
import db from '../db/database.js';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin123';

// Simple API key authentication middleware
function requireAdminAuth(req, res, next) {
  const apiKey = req.headers['x-admin-api-key'];
  
  if (!apiKey || apiKey !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  
  next();
}

const router = Router();

// Apply auth middleware to all routes
router.use(requireAdminAuth);

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
    
    const validStatuses = ['confirmed', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Укажите корректный статус: confirmed, completed' });
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

// DELETE /api/admin/bookings/:id - Cancel/delete a booking
router.delete('/bookings/:id', (req, res) => {
  try {
    const booking = getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    
    // Delete the booking to free up the slot
    db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
    
    res.json({ success: true, message: 'Бронирование отменено' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;
