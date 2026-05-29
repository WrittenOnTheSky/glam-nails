import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/salon.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    service_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id),
    UNIQUE(date, time)
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    address TEXT,
    address_sub TEXT,
    phone TEXT,
    phone_sub TEXT,
    email TEXT,
    email_sub TEXT,
    work_hours TEXT,
    work_hours_sub TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT,
    placeholder TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
  CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(date, time);
`);

// Seed default services if empty
const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
if (serviceCount.count === 0) {
  const insertService = db.prepare(`
    INSERT INTO services (id, name, price, duration, description) 
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const defaultServices = [
    { id: 's1', name: 'Классический маникюр', price: 1500, duration: 60, description: 'Классический маникюр с обработкой кутикулы' },
    { id: 's2', name: 'Аппаратный маникюр', price: 1800, duration: 60, description: 'Аппаратный маникюр с фрезами' },
    { id: 's3', name: 'Комбинированный маникюр', price: 2000, duration: 75, description: 'Комбинированный маникюр' },
    { id: 's4', name: 'Гель-лак', price: 1200, duration: 45, description: 'Покрытие гель-лаком' },
    { id: 's5', name: 'Френч', price: 1500, duration: 60, description: 'Французский маникюр' },
    { id: 's6', name: 'Градиент', price: 1800, duration: 60, description: 'Градиентное покрытие' },
    { id: 's7', name: 'Наращивание гелем', price: 3000, duration: 120, description: 'Наращивание ногтей гелем' },
    { id: 's8', name: 'Коррекция ногтей', price: 2500, duration: 90, description: 'Коррекция наращенных ногтей' },
    { id: 's9', name: 'Простой дизайн', price: 500, duration: 30, description: 'Простой nail-art дизайн' },
    { id: 's10', name: 'Сложный дизайн', price: 1000, duration: 60, description: 'Сложный nail-art дизайн' },
    { id: 's11', name: 'Стразы', price: 400, duration: 15, description: 'Украшение стразами (до 10 шт.)' },
    { id: 's12', name: 'Парафинотерапия', price: 800, duration: 30, description: 'Парафиновая ванночка для рук' },
    { id: 's13', name: 'Снятие покрытия', price: 500, duration: 30, description: 'Снятие гель-лака' },
  ];
  
  for (const service of defaultServices) {
    insertService.run(service.id, service.name, service.price, service.duration, service.description);
  }
}

export default db;

// Helper functions
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getAllServices() {
  return db.prepare('SELECT * FROM services ORDER BY id').all();
}

export function getServiceById(id) {
  return db.prepare('SELECT * FROM services WHERE id = ?').get(id);
}

export function createBooking(booking) {
  const { clientName, phone, serviceId, date, time } = booking;
  const id = generateId();
  
  const stmt = db.prepare(`
    INSERT INTO bookings (id, client_name, phone, service_id, date, time)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  try {
    stmt.run(id, clientName, phone, serviceId, date, time);
    return { success: true, id };
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: 'Это время уже занято' };
    }
    throw error;
  }
}

export function getBookingsByDate(date) {
  return db.prepare('SELECT * FROM bookings WHERE date = ?').all(date);
}

export function getBookingById(id) {
  return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
}

export function getAvailableSlots(date) {
  const bookedSlots = db.prepare(
    "SELECT time FROM bookings WHERE date = ? AND status != 'cancelled'"
  ).all(date).map(b => b.time);
  
  const allSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
  return allSlots.filter(slot => !bookedSlots.includes(slot));
}

// Service CRUD operations
export function createService(service) {
  const { name, price, duration, description } = service;
  const id = generateId();
  
  const stmt = db.prepare(`
    INSERT INTO services (id, name, price, duration, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, name, price, duration, description);
  return getServiceById(id);
}

export function updateService(id, updates) {
  const service = getServiceById(id);
  if (!service) return null;
  
  const { name, price, duration, description } = { ...service, ...updates };
  
  const stmt = db.prepare(`
    UPDATE services SET name = ?, price = ?, duration = ?, description = ?
    WHERE id = ?
  `);
  
  stmt.run(name, price, duration, description, id);
  return getServiceById(id);
}

export function deleteService(id) {
  const service = getServiceById(id);
  if (!service) return false;
  
  const stmt = db.prepare('DELETE FROM services WHERE id = ?');
  stmt.run(id);
  return true;
}

// Contacts operations
export function getContacts() {
  let contacts = db.prepare('SELECT * FROM contacts LIMIT 1').get();
  if (!contacts) {
    // Create default contacts
    const stmt = db.prepare(`
      INSERT INTO contacts (id, address, address_sub, phone, phone_sub, email, email_sub, work_hours, work_hours_sub)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(generateId(), 'ул. Красивая, 15', 'Москва, Россия', '+7 (999) 123-45-67', 'Звоните с 10:00 до 20:00', 'hello@glamnails.ru', 'Ответим в течение часа', '10:00 - 20:00', 'Ежедневно');
    contacts = db.prepare('SELECT * FROM contacts LIMIT 1').get();
  }
  return contacts;
}

export function updateContacts(updates) {
  const current = getContacts();
  const address = updates.address !== undefined ? updates.address : current.address;
  const address_sub = updates.address_sub !== undefined ? updates.address_sub : current.address_sub;
  const phone = updates.phone !== undefined ? updates.phone : current.phone;
  const phone_sub = updates.phone_sub !== undefined ? updates.phone_sub : current.phone_sub;
  const email = updates.email !== undefined ? updates.email : current.email;
  const email_sub = updates.email_sub !== undefined ? updates.email_sub : current.email_sub;
  const work_hours = updates.work_hours !== undefined ? updates.work_hours : current.work_hours;
  const work_hours_sub = updates.work_hours_sub !== undefined ? updates.work_hours_sub : current.work_hours_sub;
  
  const stmt = db.prepare(`
    UPDATE contacts SET address = ?, address_sub = ?, phone = ?, phone_sub = ?, email = ?, email_sub = ?, work_hours = ?, work_hours_sub = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(address, address_sub, phone, phone_sub, email, email_sub, work_hours, work_hours_sub, current.id);
  return getContacts();
}

// Gallery operations
export function getGalleryImages() {
  return db.prepare('SELECT * FROM gallery ORDER BY sort_order, created_at').all();
}

export function addGalleryImage(image) {
  const { title, image_url, placeholder } = image;
  const id = generateId();
  
  // Get max sort order
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM gallery').get();
  const sortOrder = (maxOrder.max || 0) + 1;
  
  const stmt = db.prepare(`
    INSERT INTO gallery (id, title, image_url, placeholder, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, title, image_url, placeholder, sortOrder);
  return db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
}

export function updateGalleryImage(id, updates) {
  const image = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
  if (!image) return null;
  
  const { title, image_url, placeholder, sort_order } = { ...image, ...updates };
  
  const stmt = db.prepare(`
    UPDATE gallery SET title = ?, image_url = ?, placeholder = ?, sort_order = ?
    WHERE id = ?
  `);
  
  stmt.run(title, image_url, placeholder, sort_order || image.sort_order, id);
  return db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
}

export function deleteGalleryImage(id) {
  const image = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
  if (!image) return false;
  
  db.prepare('DELETE FROM gallery WHERE id = ?').run(id);
  return true;
}

// Bookings management
export function getAllBookings() {
  return db.prepare(`
    SELECT b.*, s.name as service_name, s.price as service_price 
    FROM bookings b 
    LEFT JOIN services s ON b.service_id = s.id 
    ORDER BY b.date DESC, b.time DESC
  `).all();
}

export function updateBookingStatus(id, status) {
  const booking = getBookingById(id);
  if (!booking) return null;
  
  const stmt = db.prepare('UPDATE bookings SET status = ? WHERE id = ?');
  stmt.run(status, id);
  return getBookingById(id);
}
