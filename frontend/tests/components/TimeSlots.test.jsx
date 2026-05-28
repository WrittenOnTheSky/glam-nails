import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimeSlots from '../../src/components/TimeSlots.jsx';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TimeSlots', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  test('показывает placeholder когда дата не выбрана', () => {
    render(<TimeSlots 
      date="" 
      onSelect={vi.fn()} 
      selectedTime="" 
      apiBaseUrl="http://localhost:3001" 
    />);
    
    expect(screen.getByText(/Сначала выберите дату/)).toBeTruthy();
  });

  test('показывает loading state при загрузке', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<TimeSlots 
      date="2026-06-01" 
      onSelect={vi.fn()} 
      selectedTime="" 
      apiBaseUrl="http://localhost:3001" 
    />);
    
    expect(screen.getByText(/Загрузка слотов/)).toBeTruthy();
  });

  test('отображает доступные слоты', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        slots: ['10:00', '11:00', '12:00', '14:00']
      })
    });
    
    render(<TimeSlots 
      date="2026-06-01" 
      onSelect={vi.fn()} 
      selectedTime="" 
      apiBaseUrl="http://localhost:3001" 
    />);
    
    await waitFor(() => {
      expect(screen.getByText('10:00')).toBeTruthy();
    });
  });

  test('показывает empty state когда слотов нет', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ slots: [] })
    });
    
    render(<TimeSlots 
      date="2026-06-01" 
      onSelect={vi.fn()} 
      selectedTime="" 
      apiBaseUrl="http://localhost:3001" 
    />);
    
    await waitFor(() => {
      expect(screen.getByText(/Нет свободных слотов/)).toBeTruthy();
    });
  });

  test('показывает состояние ошибки', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Test error' })
    });
    
    render(<TimeSlots 
      date="2026-06-01" 
      onSelect={vi.fn()} 
      selectedTime="" 
      apiBaseUrl="http://localhost:3001" 
    />);
    
    await waitFor(() => {
      expect(screen.getByText(/Test error/)).toBeTruthy();
    });
  });

  test('вызывает onSelect при выборе слота', async () => {
    const onSelect = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        slots: ['10:00', '11:00', '12:00']
      })
    });
    
    render(<TimeSlots 
      date="2026-06-01" 
      onSelect={onSelect} 
      selectedTime="" 
      apiBaseUrl="http://localhost:3001" 
    />);
    
    await waitFor(() => {
      const slotButton = screen.getByText('11:00');
      fireEvent.click(slotButton);
      expect(onSelect).toHaveBeenCalledWith('11:00');
    });
  });
});
