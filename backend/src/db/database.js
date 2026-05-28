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
