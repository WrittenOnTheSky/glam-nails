import request from 'supertest';
import app from '../src/index.js';

describe('GET /api/services', () => {
  test('возвращает статус 200', async () => {
    const response = await request(app).get('/api/services');
    expect(response.status).toBe(200);
  });

  test('возвращает массив услуг', async () => {
    const response = await request(app).get('/api/services');
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('каждая услуга содержит: id, name, price, duration', async () => {
    const response = await request(app).get('/api/services');
    const services = response.body;
    
    expect(services.length).toBeGreaterThan(0);
    
    services.forEach(service => {
      expect(service).toHaveProperty('id');
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('price');
      expect(service).toHaveProperty('duration');
    });
  });

  test('цены — положительные числа', async () => {
    const response = await request(app).get('/api/services');
    const services = response.body;
    
    services.forEach(service => {
      expect(typeof service.price).toBe('number');
      expect(service.price).toBeGreaterThan(0);
    });
  });

  test('длительность — в минутах, положительное число', async () => {
    const response = await request(app).get('/api/services');
    const services = response.body;
    
    services.forEach(service => {
      expect(typeof service.duration).toBe('number');
      expect(service.duration).toBeGreaterThan(0);
    });
  });
});
