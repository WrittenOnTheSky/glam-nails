import request from 'supertest';
import app from '../src/index.js';

describe('GET /api/available-slots', () => {
  test('возвращает статус 200 для валидной даты', async () => {
    const futureDate = '2026-12-01';
    const response = await request(app)
      .get('/api/available-slots')
      .query({ date: futureDate });
    
    expect(response.status).toBe(200);
  });

  test('возвращает объект с массивом слотов', async () => {
    const futureDate = '2026-12-01';
    const response = await request(app)
      .get('/api/available-slots')
      .query({ date: futureDate });
    
    expect(response.body).toHaveProperty('date');
    expect(response.body).toHaveProperty('slots');
    expect(Array.isArray(response.body.slots)).toBe(true);
  });

  test('слоты в формате HH:00 (10:00 - 20:00)', async () => {
    const futureDate = '2026-12-01';
    const response = await request(app)
      .get('/api/available-slots')
      .query({ date: futureDate });
    
    const slots = response.body.slots;
    const timeRegex = /^([01]\d|2[0-3]):00$/;
    
    slots.forEach(slot => {
      expect(slot).toMatch(timeRegex);
    });
  });

  test('исключает уже забронированные слоты', async () => {
    const testDate = '2026-12-15';
    
    // Book a slot first
    await request(app)
      .post('/api/bookings')
      .send({
        clientName: 'Тест Тестов',
        phone: '+79991234567',
        serviceId: 's1',
        date: testDate,
        time: '14:00'
      });
    
    // Get available slots
    const response = await request(app)
      .get('/api/available-slots')
      .query({ date: testDate });
    
    expect(response.body.slots).not.toContain('14:00');
  });

  test('возвращает ошибку 400 для невалидной даты', async () => {
    const response = await request(app)
      .get('/api/available-slots')
      .query({ date: 'invalid-date' });
    
    expect(response.status).toBe(400);
  });

  test('возвращает ошибку 400 без указания даты', async () => {
    const response = await request(app)
      .get('/api/available-slots');
    
    expect(response.status).toBe(400);
  });
});
