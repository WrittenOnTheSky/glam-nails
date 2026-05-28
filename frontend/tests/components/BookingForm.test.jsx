import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingForm from '../../src/components/BookingForm.jsx';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('BookingForm', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  test('показывает ошибку при пустом имени', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { id: 's1', name: 'Маникюр', price: 1500, duration: 60 }
      ])
    });
    
    render(<BookingForm 
      selectedDate="2026-06-01"
      selectedTime="14:00"
      onSuccess={vi.fn()}
      apiBaseUrl="http://localhost:30051" 
    />);
    
    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText(/Как вас зовут/);
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.blur(nameInput);
    });
    
    expect(screen.getByText(/Введите ваше имя/)).toBeTruthy();
  });

  test('показывает ошибку при невалидном телефоне', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { id: 's1', name: 'Маникюр', price: 1500, duration: 60 }
      ])
    });
    
    render(<BookingForm 
      selectedDate="2026-06-01"
      selectedTime="14:00"
      onSuccess={vi.fn()}
      apiBaseUrl="http://localhost:3001" 
    />);
    
    await waitFor(() => {
      const phoneInput = screen.getByPlaceholderText(/___.*__-__-__/);
      fireEvent.change(phoneInput, { target: { value: 'abc' } });
      fireEvent.blur(phoneInput);
    });
    
    expect(screen.getByText(/корректный номер/)).toBeTruthy();
  });

  test('не отправляет форму с ошибками', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { id: 's1', name: 'Маникюр', price: 1500, duration: 60 }
      ])
    });
    
    const onSuccess = vi.fn();
    render(<BookingForm 
      selectedDate="2026-06-01"
      selectedTime="14:00"
      onSuccess={onSuccess}
      apiBaseUrl="http://localhost:3001" 
    />);
    
    await waitFor(() => {
      const submitButton = screen.getByText(/Записаться/);
      fireEvent.click(submitButton);
    });
    
    // Should not call onSuccess since form is invalid
    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  test('показывает состояние загрузки при отправке', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { id: 's1', name: 'Маникюр', price: 1500, duration: 60 }
      ])
    });
    
    render(<BookingForm 
      selectedDate="2026-06-01"
      selectedTime="14:00"
      onSuccess={vi.fn()}
      apiBaseUrl="http://localhost:3001" 
    />);
    
    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText(/Как вас зовут/);
      const phoneInput = screen.getByPlaceholderText(/___.*__-__-__/);
      const selectInput = screen.getByRole('combobox');
      
      fireEvent.change(nameInput, { target: { value: 'Тест Тестов' } });
      fireEvent.change(phoneInput, { target: { value: '+79991234567' } });
      fireEvent.change(selectInput, { target: { value: 's1' } });
    });
    
    // Mock the POST request to never resolve (loading state)
    mockFetch.mockImplementation(() => new Promise(() => {}));
    
    await waitFor(() => {
      const submitButton = screen.getByText(/Записаться/);
      fireEvent.click(submitButton);
    });
    
    expect(screen.getByText(/Отправка/)).toBeTruthy();
  });

  test('отображает подтверждение после успешной записи', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { id: 's1', name: 'Маникюр', price: 1500, duration: 60 }
      ])
    });
    
    const onSuccess = vi.fn();
    render(<BookingForm 
      selectedDate="2026-06-01"
      selectedTime="14:00"
      onSuccess={onSuccess}
      apiBaseUrl="http://localhost:3001" 
    />);
    
    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText(/Как вас зовут/);
      const phoneInput = screen.getByPlaceholderText(/___.*__-__-__/);
      const selectInput = screen.getByRole('combobox');
      
      fireEvent.change(nameInput, { target: { value: 'Тест Тестов' } });
      fireEvent.change(phoneInput, { target: { value: '+79991234567' } });
      fireEvent.change(selectInput, { target: { value: 's1' } });
    });
    
    // Mock the POST request to succeed
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ bookingId: 'test-123', success: true })
    });
    
    await waitFor(() => {
      const submitButton = screen.getByText(/Записаться/);
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Запись создана/)).toBeTruthy();
    });
    expect(onSuccess).toHaveBeenCalledWith('test-123');
  });

  test('показывает ошибку при занятом слоте', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { id: 's1', name: 'Маникюр', price: 1500, duration: 60 }
      ])
    });
    
    render(<BookingForm 
      selectedDate="2026-06-01"
      selectedTime="14:00"
      onSuccess={vi.fn()}
      apiBaseUrl="http://localhost:3001" 
    />);
    
    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText(/Как вас зовут/);
      const phoneInput = screen.getByPlaceholderText(/___.*__-__-__/);
      const selectInput = screen.getByRole('combobox');
      
      fireEvent.change(nameInput, { target: { value: 'Тест' } });
      fireEvent.change(phoneInput, { target: { value: '+79991234567' } });
      fireEvent.change(selectInput, { target: { value: 's1' } });
    });
    
    // Mock the POST request to fail with 409
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ error: 'Это время уже занято' })
    });
    
    await waitFor(() => {
      const submitButton = screen.getByText(/Записаться/);
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Это время уже занято/)).toBeTruthy();
    });
  });
});
