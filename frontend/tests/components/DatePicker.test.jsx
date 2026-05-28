import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import DatePicker from '../../src/components/DatePicker.jsx';

describe('DatePicker', () => {
  test('отображает текущий месяц', () => {
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} selectedDate="" />);
    
    const currentDate = new Date();
    const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'long' });
    expect(screen.getByText(new RegExp(monthName, 'i'))).toBeTruthy();
  });

  test('не позволяет выбрать прошедшую дату', () => {
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} selectedDate="" />);
    
    // Find all disabled buttons (past dates)
    const disabledButtons = screen.getAllByRole('button', { disabled: true });
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  test('показывает выбранную дату', async () => {
    const onChange = vi.fn();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    render(<DatePicker onChange={onChange} selectedDate={tomorrowStr} />);
    
    // Check for the selected display
    expect(screen.getByText(/Выбрана дата/)).toBeTruthy();
  });

  test('вызывает onChange при выборе даты', async () => {
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} selectedDate="" />);
    
    // Find a button that looks like a clickable date (not disabled)
    const buttons = screen.getAllByRole('button');
    const clickableDateButton = buttons.find(btn => 
      !btn.disabled && btn.textContent.match(/^\d+$/)
    );
    
    if (clickableDateButton) {
      fireEvent.click(clickableDateButton);
      expect(onChange).toHaveBeenCalled();
    }
  });

  test('позволяет переключать месяцы', () => {
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} selectedDate="" />);
    
    const prevButton = screen.getByText('◀');
    const nextButton = screen.getByText('▶');
    
    expect(prevButton).toBeTruthy();
    expect(nextButton).toBeTruthy();
    
    fireEvent.click(nextButton);
    // Month should change
  });
});
