import { useState, useEffect } from 'react';
import DatePicker from './DatePicker';
import TimeSlots from './TimeSlots';
import BookingForm from './BookingForm';

export default function BookingPage({ apiBaseUrl }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingId, setBookingId] = useState('');

  // Reset time when date changes
  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate]);

  const handleBookingSuccess = (id) => {
    setBookingId(id);
  };

  return (
    <div className="booking-page">
      <div className="booking-header">
        <h2>📅 Онлайн-запись</h2>
        <p>Выберите удобную дату, время и запишитесь на услугу</p>
      </div>

      <div className="booking-steps">
        <div className="step">
          <div className="step-number">1</div>
          <h3>Дата</h3>
          <DatePicker onChange={setSelectedDate} selectedDate={selectedDate} />
        </div>

        <div className="step" style={{ opacity: selectedDate ? 1 : 0.5 }}>
          <div className="step-number">2</div>
          <h3>Время</h3>
          <TimeSlots 
            date={selectedDate} 
            onSelect={setSelectedTime} 
            selectedTime={selectedTime}
            apiBaseUrl={apiBaseUrl}
          />
        </div>

        <div className="step" style={{ opacity: selectedTime ? 1 : 0.5 }}>
          <div className="step-number">3</div>
          <h3>Данные</h3>
          <BookingForm
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSuccess={handleBookingSuccess}
            apiBaseUrl={apiBaseUrl}
          />
        </div>
      </div>

      <style>{`
        .booking-page {
          max-width: 1200px;
          margin: 0 auto;
        }
        .booking-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .booking-header h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 2.5rem;
          color: #E91E8C;
          margin-bottom: 12px;
        }
        .booking-header p {
          color: #666;
          font-size: 1.1rem;
        }
        .booking-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .step {
          display: flex;
          flex-direction: column;
          transition: opacity 0.3s ease;
        }
        .step-number {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #FF69B4, #E91E8C);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .step h3 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.4rem;
          color: #E91E8C;
          margin-bottom: 16px;
        }
        @media (max-width: 900px) {
          .booking-steps {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
