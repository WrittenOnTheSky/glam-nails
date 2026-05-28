import { Router } from 'express';
import { createBooking, getBookingById, getServiceById } from '../db/database.js';

const router = Router();

// Helper to validate date format YYYY-MM-DD
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Helper to validate Russian phone number
function isValidPhone(phone) {
  const cleaned = phone.replace(/\s|\(|\)|-|\+/g, '');
  const phoneRegex = /^(\+?7|8)?[0-9]{10,11}$/;
  return phoneRegex.test(cleaned);
}

// GET /api/bookings/:id - Get booking by ID
router.get('/:id', (req, res) => {
  try {
    const booking = getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    
    const service = getServiceById(booking.service_id);
    res.json({
      ...booking,
      service: service ? { name: service.name, price: service.price, duration: service.duration } : null
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// POST /api/bookings - Create new booking
router.post('/', async (req, res) => {
  try {
    const { clientName, phone, serviceId, date, time } = req.body;
    
    // Validation
    const errors = [];
    
    if (!clientName || clientName.trim().length < 2) {
      errors.push({ field: 'clientName', message: 'Имя должно содержать минимум 2 символа' });
    }
    
    if (!phone || !isValidPhone(phone)) {
      errors.push({ field: 'phone', message: 'Введите корректный номер телефона (российский формат)' });
    }
    
    if (!serviceId) {
      errors.push({ field: 'serviceId', message: 'Выберите услугу' });
    }
    
    if (!date || !isValidDate(date)) {
      errors.push({ field: 'date', message: 'Укажите дату в формате YYYY-MM-DD' });
    }
    
    const timeRegex = /^([01]\d|2[0-3]):00$/;
    if (!time || !timeRegex.test(time)) {
      errors.push({ field: 'time', message: 'Время должно быть в формате HH:00' });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const requestedDate = new Date(date);
    if (requestedDate < today) {
      return res.status(400).json({ error: 'Нельзя бронировать на прошлую дату' });
    }
    
    // Create booking
    const result = createBooking({ clientName, phone, serviceId, date, time });
    
    if (!result.success) {
      return res.status(409).json({ error: result.error });
    }
    
    res.status(201).json({
      success: true,
      bookingId: result.id,
      message: 'Запись успешно создана'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;
