import { useState } from 'react';

export default function DatePicker({ onChange, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('ru-RU', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add padding for days before the first day of month
    const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = startPadding; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      days.push(d);
    }
    
    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add padding for days after the last day
    const endPadding = 42 - days.length;
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const isDisabled = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isSelected = (date) => {
    return formatDate(date) === selectedDate;
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date) => {
    if (!isDisabled(date)) {
      onChange(formatDate(date));
    }
  };

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const days = getDaysInMonth(currentMonth);

  return (
    <div className="date-picker">
      <div className="date-picker-header">
        <button onClick={prevMonth} className="nav-btn">◀</button>
        <span className="month-year">
          {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={nextMonth} className="nav-btn">▶</button>
      </div>
      
      <div className="weekdays">
        {weekDays.map((day) => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      
      <div className="days-grid">
        {days.map((date, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(date)}
            disabled={isDisabled(date)}
            className={`day ${!isCurrentMonth(date) ? 'other-month' : ''} ${isSelected(date) ? 'selected' : ''} ${isDisabled(date) ? 'disabled' : ''}`}
          >
            {date.getDate()}
          </button>
        ))}
      </div>
      
      {selectedDate && (
        <div className="selected-display">
          Выбрана дата: {formatDisplayDate(new Date(selectedDate))}
        </div>
      )}

      <style>{`
        .date-picker {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(255, 105, 180, 0.15);
        }
        .date-picker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .nav-btn {
          background: linear-gradient(135deg, #FF69B4, #E91E8C);
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.9rem;
          transition: transform 0.2s ease;
        }
        .nav-btn:hover {
          transform: scale(1.1);
        }
        .month-year {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: #E91E8C;
          text-transform: capitalize;
        }
        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 8px;
        }
        .weekday {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: #666;
          padding: 8px 0;
        }
        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .day {
          aspect-ratio: 1;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          color: #2D2D2D;
          transition: all 0.2s ease;
        }
        .day:hover:not(.disabled):not(.selected) {
          background: #FFF5F8;
          transform: scale(1.05);
        }
        .day.other-month {
          color: #CCC;
        }
        .day.disabled {
          color: #DDD;
          cursor: not-allowed;
        }
        .day.selected {
          background: linear-gradient(135deg, #FF69B4, #E91E8C);
          color: white;
          font-weight: 600;
        }
        .selected-display {
          margin-top: 16px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #FFF5F8, #FFE4EF);
          border-radius: 8px;
          text-align: center;
          font-weight: 500;
          color: #E91E8C;
        }
      `}</style>
    </div>
  );
}
