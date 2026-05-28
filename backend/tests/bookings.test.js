import request from 'supertest';
import app from '../src/index.js';

describe('POST /api/bookings', () => {
  // Validation tests
  test('требует обязательные поля: name, phone, date, time', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });

  test('валидирует формат телефона (российский)', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({
        clientName: 'Тест',
        phone: 'invalid',
        serviceId: 's1',
        date: '2026-06-15',
        time: '14:00'
      });
    
    expect(response.status).toBe(400);
  });

  test('требует имя минимум 2 символа', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({
        clientName: 'Т',
        phone: '+79991234567',
        serviceId: 's1',
        date: '2026-06-15',
        time: '14:00'
      });
    
    expect(response.status).toBe(400);
  });

  // Successful booking
  test('создает бронирование с валидными данными', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({
        clientName: 'Иван Иванов',
        phone: '+79991234567',
        serviceId: 's1',
        date: '2026-07-01',
        time: '15:00'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  test('возвращает id бронирования', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({
        clientName: 'Петр Петров',
        phone: '+79991234567',
        serviceId: 's2',
        date: '2026-07-02',
        time: '16:00'
      });
    
    expect(response.body).toHaveProperty('bookingId');
    expect(typeof response.body.bookingId).toBe('string');
  });

  test('не дает забронировать занятый слот', async () => {
    const testDate = '2026-07-05';
    const testTime = '17:00';
    
    // First booking
    await request(app)
      .post('/api/bookings')
      .send({
        clientName: 'Мария',
        phone: '+79991234567',
        serviceId: 's1',
        date: testDate,
        time: testTime
      });
    
    // Second booking attempt
    const response = await request(app)
      .post('/api/bookings')
      .send({
        clientName: 'Алексей',
        phone: '+79991234567',
        serviceId: 's1',
        date: testDate,
        time: testTime
      });
    
    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error');
  });

  // Error handling
  test('возвращает 400 для прошлой даты', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({
        clientName: 'Тест',
        phone: '+79991234567',
        serviceId: 's1',
        date: '2020-01-01',
        time: '14:00'
      });
    
    expect(response.status).toBe(400);
  });

  test('возвращает 409 для занятого слота', async () => {
    const testDate = '2026-07-10';
    const testTime = '18:00';
    
    await request(app)
      .post('/api/bookings')
      .send({
        clientName: 'Клиент1',
        phone: '+79991234567',
        serviceId: 's1',
        date: testDate,
        time: testTime
      });
    
    const response = await request(app)
      .post('/api/bookings')
      .send({
        clientName: 'Клиент2',
        phone: '+79991234567',
        serviceId: 's1',
        date: testDate,
        time: testTime
      });
    
    expect(response.status).toBe(409);
  });
});

describe('GET /api/bookings/:id', () => {
  test('возвращает данные бронирования по id', async () => {
    // Create a booking first
    const createResponse = await request(app)
      .post('/api/bookings')
      .send({
        clientName: 'Сергей',
        phone: '+79991234567',
        serviceId: 's1',
        date: '2026-08-01',
        time: '12:00'
      });
    
    const bookingId = createResponse.body.bookingId;
    
    // Get the booking
    const response = await request(app)
      .get(`/api/bookings/${bookingId}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', bookingId);
    expect(response.body).toHaveProperty('client_name');
    expect(response.body).toHaveProperty('service');
  });

  test('возвращает 404 для несуществующего id', async () => {
    const response = await request(app)
      .get('/api/bookings/non-existent-id');
    
    expect(response.status).toBe(404);
  });
});
