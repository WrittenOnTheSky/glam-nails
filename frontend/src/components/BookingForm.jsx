import { useState, useEffect } from 'react';

export default function BookingForm({ selectedDate, selectedTime, onSuccess, apiBaseUrl }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/services`);
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
        setServices([
          { id: '1', name: 'Маникюр', price: 1500, duration: 60 },
          { id: '2', name: 'Покрытие', price: 1200, duration: 45 },
          { id: '3', name: 'Дизайн', price: 500, duration: 30 }
        ]);
      }
    };
    fetchServices();
  }, [apiBaseUrl]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Введите ваше имя';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }
    
    const phoneRegex = /^(\+7|7|8)?[\s.-]?\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{2}[\s.-]?[0-9]{2}$/;
    if (!phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Введите корректный номер телефона';
    }

    if (!service) {
      newErrors.service = 'Выберите услугу';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;
    if (!selectedDate || !selectedTime) {
      setServerError('Пожалуйста, выберите дату и время');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: name.trim(),
          phone: phone.trim(),
          serviceId: service,
          date: selectedDate,
          time: selectedTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании бронирования');
      }

      const data = await response.json();
      setBookingId(data.bookingId || data.id);
      setSuccess(true);
      onSuccess(data.bookingId || data.id);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="booking-success">
        <div className="success-icon">✓</div>
        <h3>Запись создана!</h3>
        <p>Номер вашей записи: <strong>{bookingId}</strong></p>
        <p>Ждём вас {new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в {selectedTime}</p>
        <p className="success-note">Мы отправили подтверждение на ваш номер телефона.</p>
        
        <style>{`
          .booking-success {
            background: white;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(255, 105, 180, 0.15);
          }
          .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            font-size: 2.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }
          .booking-success h3 {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-size: 1.8rem;
            color: #E91E8C;
            margin-bottom: 16px;
          }
          .booking-success p {
            color: #666;
            margin-bottom: 12px;
          }
          .booking-success strong {
            color: #E91E8C;
            font-size: 1.2rem;
          }
          .success-note {
            font-size: 0.9rem;
            opacity: 0.8;
          }
        `}</style>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Ваше имя</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Как вас зовут?"
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Телефон</label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+7 (___) ___-__-__"
          className={errors.phone ? 'error' : ''}
        />
        {errors.phone && <span className="error-message">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="service">Услуга</label>
        <select
          id="service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className={errors.service ? 'error' : ''}
        >
          <option value="">Выберите услугу</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.price} ₽ ({s.duration} мин)
            </option>
          ))}
        </select>
        {errors.service && <span className="error-message">{errors.service}</span>}
      </div>

      {serverError && (
        <div className="server-error">
          ⚠️ {serverError}
        </div>
      )}

      <button type="submit" disabled={submitting || !selectedDate || !selectedTime} className="submit-btn">
        {submitting ? 'Отправка...' : 'Записаться'}
      </button>

      <style>{`
        .booking-form {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(255, 105, 180, 0.15);
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #2D2D2D;
        }
        input, select {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #FFE4EF;
          border-radius: 12px;
          font-size: 1rem;
          font-family: inherit;
          transition: border-color 0.2s ease;
          background: #FFFAFC;
        }
        input:focus, select:focus {
          outline: none;
          border-color: #FF69B4;
        }
        input.error, select.error {
          border-color: #E91E8C;
        }
        .error-message {
          display: block;
          margin-top: 6px;
          font-size: 0.85rem;
          color: #E91E8C;
        }
        .server-error {
          padding: 14px 16px;
          background: #FFF0F3;
          border-radius: 12px;
          color: #E91E8C;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }
        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #FF69B4, #E91E8C);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 105, 180, 0.4);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}
