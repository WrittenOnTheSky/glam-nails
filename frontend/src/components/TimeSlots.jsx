import { useState, useEffect } from 'react';

const ALL_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00'
];

export default function TimeSlots({ date, onSelect, selectedTime, apiBaseUrl }) {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!date) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/api/available-slots?date=${date}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Ошибка при загрузке слотов');
        }
        const data = await response.json();
        setAvailableSlots(data.slots || []);
        setBookedSlots(ALL_SLOTS.filter(slot => !(data.slots || []).includes(slot)));
      } catch (err) {
        setError(err.message);
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [date, apiBaseUrl]);

  const handleSlotClick = (slot) => {
    if (availableSlots.includes(slot)) {
      onSelect(slot);
    }
  };

  if (!date) {
    return (
      <div className="time-slots-placeholder">
        <p>Сначала выберите дату</p>
        <style>{`
          .time-slots-placeholder {
            padding: 40px;
            text-align: center;
            background: white;
            border-radius: 16px;
            color: #666;
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="time-slots-loading">
        <div className="spinner"></div>
        <p>Загрузка слотов...</p>
        <style>{`
          .time-slots-loading {
            padding: 60px;
            text-align: center;
            background: white;
            border-radius: 16px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #FFE4EF;
            border-top-color: #FF69B4;
            border-radius: 50%;
            margin: 0 auto 16px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .time-slots-loading p {
            color: #666;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="time-slots-error">
        <p>⚠️ {error}</p>
        <style>{`
          .time-slots-error {
            padding: 40px;
            text-align: center;
            background: #FFF0F3;
            border-radius: 16px;
            color: #E91E8C;
          }
        `}</style>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="time-slots-empty">
        <p>😔 Нет свободных слотов на этот день</p>
        <style>{`
          .time-slots-empty {
            padding: 40px;
            text-align: center;
            background: white;
            border-radius: 16px;
            color: #666;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="time-slots">
      <div className="slots-grid">
        {ALL_SLOTS.map((slot) => {
          const isAvailable = availableSlots.includes(slot);
          const isSelected = selectedTime === slot;
          
          return (
            <button
              key={slot}
              onClick={() => handleSlotClick(slot)}
              disabled={!isAvailable}
              className={`slot ${isAvailable ? 'available' : 'booked'} ${isSelected ? 'selected' : ''}`}
            >
              {slot}
            </button>
          );
        })}
      </div>
      
      <p className="legend">
        <span className="dot available"></span> свободен
        <span className="dot booked"></span> занят
      </p>

      <style>{`
        .time-slots {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(255, 105, 180, 0.15);
        }
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }
        .slot {
          padding: 16px 8px;
          border: 2px solid transparent;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .slot.available {
          background: linear-gradient(135deg, #FFF5F8, #FFE4EF);
          color: #E91E8C;
          border-color: rgba(255, 105, 180, 0.2);
        }
        .slot.available:hover {
          border-color: #FF69B4;
          transform: scale(1.05);
        }
        .slot.booked {
          background: #F5F5F5;
          color: #CCC;
          cursor: not-allowed;
          text-decoration: line-through;
        }
        .slot.selected {
          background: linear-gradient(135deg, #FF69B4, #E91E8C);
          color: white;
          border-color: #FF69B4;
        }
        .legend {
          margin-top: 16px;
          text-align: center;
          font-size: 0.85rem;
          color: #666;
          display: flex;
          justify-content: center;
          gap: 20px;
        }
        .dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 6px;
          vertical-align: middle;
        }
        .dot.available {
          background: linear-gradient(135deg, #FFF5F8, #FFE4EF);
          border: 2px solid rgba(255, 105, 180, 0.4);
        }
        .dot.booked {
          background: #F5F5F5;
        }
        @media (max-width: 480px) {
          .slots-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
