import { Router } from 'express';
import { getContacts, updateContacts } from '../db/database.js';

const router = Router();

// GET /api/contacts - Get contacts
router.get('/', (req, res) => {
  try {
    const contacts = getContacts();
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// PUT /api/contacts - Update contacts
router.put('/', (req, res) => {
  try {
    const { address, address_sub, phone, phone_sub, email, email_sub, work_hours, work_hours_sub } = req.body;
    
    const contacts = updateContacts({
      address,
      address_sub,
      phone,
      phone_sub,
      email,
      email_sub,
      work_hours,
      work_hours_sub
    });
    
    res.json(contacts);
  } catch (error) {
    console.error('Error updating contacts:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;
