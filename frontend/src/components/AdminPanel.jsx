import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('services');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  // Data states
  const [services, setServices] = useState([]);
  const [contacts, setContacts] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // Form states
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ name: '', price: '', duration: '', description: '' });
  const [contactsForm, setContactsForm] = useState(null);
  const [galleryForm, setGalleryForm] = useState({ title: '', image_url: '', placeholder: '' });
  
  // Loading/Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setApiKey(password);
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Неверный пароль');
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = {};
      if (activeTab === 'bookings') {
        headers['X-Admin-Api-Key'] = apiKey;
      }

      switch (activeTab) {
        case 'services':
          const servicesRes = await fetch(`${API_BASE}/api/services`);
          setServices(await servicesRes.json());
          break;
        case 'contacts':
          const contactsRes = await fetch(`${API_BASE}/api/contacts`);
          const contactsData = await contactsRes.json();
          setContacts(contactsData);
          setContactsForm(contactsData);
          break;
        case 'gallery':
          const galleryRes = await fetch(`${API_BASE}/api/gallery`);
          setGallery(await galleryRes.json());
          break;
        case 'bookings':
          const bookingsRes = await fetch(`${API_BASE}/api/admin/bookings`, { headers });
          if (bookingsRes.status === 401) {
            setError('Не авторизован. Обновите страницу и введите пароль заново.');
            setIsAuthenticated(false);
            return;
          }
          setBookings(await bookingsRes.json());
          break;
      }
    } catch (err) {
      setError('Ошибка загрузки данных');
    }
    setLoading(false);
  };

  // Service handlers
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const url = editingService 
        ? `${API_BASE}/api/services/${editingService.id}` 
        : `${API_BASE}/api/services`;
      const method = editingService ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serviceForm.name,
          price: parseInt(serviceForm.price),
          duration: parseInt(serviceForm.duration),
          description: serviceForm.description
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка сохранения');
      }
      
      setSuccess(editingService ? 'Услуга обновлена' : 'Услуга добавлена');
      setServiceForm({ name: '', price: '', duration: '', description: '' });
      setEditingService(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString(),
      description: service.description || ''
    });
  };

  const handleDeleteService = async (id) => {
    if (!confirm('Удалить услугу?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Ошибка удаления');
      setSuccess('Услуга удалена');
      loadData();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Contacts handlers
  const handleContactsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE}/api/contacts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactsForm)
      });
      
      if (!res.ok) throw new Error('Ошибка сохранения');
      setSuccess('Контакты сохранены');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Gallery handlers
  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE}/api/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleryForm)
      });
      
      if (!res.ok) throw new Error('Ошибка добавления');
      setSuccess('Изображение добавлено');
      setGalleryForm({ title: '', image_url: '', placeholder: '' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDeleteGalleryItem = async (id) => {
    if (!confirm('Удалить изображение?')) return;
    
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/gallery/${id}`, { method: 'DELETE' });
      setSuccess('Изображение удалено');
      loadData();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Bookings handlers
  const handleUpdateBookingStatus = async (id, status) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-Api-Key': apiKey
        },
        body: JSON.stringify({ status })
      });
      if (res.status === 401) {
        setError('Не авторизован');
        setIsAuthenticated(false);
        return;
      }
      setSuccess('Статус обновлён');
      loadData();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleCancelBooking = async (id) => {
    if (!confirm('Отменить бронирование? Время снова станет доступным для записи.')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Api-Key': apiKey }
      });
      if (res.status === 401) {
        setError('Не авторизован');
        setIsAuthenticated(false);
        return;
      }
      setSuccess('Бронирование отменено');
      loadData();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h2>🔐 Панель администратора</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {authError && <p className="error">{authError}</p>}
            <button type="submit" className="btn-primary">Войти</button>
          </form>
          <p className="hint">Пароль по умолчанию: admin123</p>
        </div>
        
        <style>{`
          .admin-login {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
          }
          .login-card {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
            text-align: center;
          }
          .login-card h2 {
            color: #E91E8C;
            margin-bottom: 24px;
            font-size: 1.8rem;
          }
          .login-card input {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #eee;
            border-radius: 8px;
            font-size: 1rem;
            margin-bottom: 16px;
            box-sizing: border-box;
          }
          .login-card input:focus {
            outline: none;
            border-color: #E91E8C;
          }
          .btn-primary {
            background: linear-gradient(135deg, #FF69B4, #E91E8C);
            color: white;
            border: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
          }
          .btn-primary:hover { opacity: 0.9; }
          .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
          .error { color: #e74c3c; margin-bottom: 16px; }
          .hint { color: #999; font-size: 0.85rem; margin-top: 16px; }
        `}</style>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>⚙️ Панель администратора</h2>
        <button onClick={() => setIsAuthenticated(false)} className="logout-btn">Выйти</button>
      </div>
      
      <div className="admin-tabs">
        {['services', 'contacts', 'gallery', 'bookings'].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'services' && '💇‍♀️ Услуги'}
            {tab === 'contacts' && '📍 Контакты'}
            {tab === 'gallery' && '🖼️ Галерея'}
            {tab === 'bookings' && '📅 Записи'}
          </button>
        ))}
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div className="admin-content">
        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="tab-content">
            <h3>Управление услугами</h3>
            
            <form className="admin-form" onSubmit={handleServiceSubmit}>
              <h4>{editingService ? 'Редактировать услугу' : 'Добавить услугу'}</h4>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Название услуги"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Цена (₽)"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Длительность (мин)"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Описание"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {editingService ? 'Сохранить' : 'Добавить'}
                </button>
                {editingService && (
                  <button type="button" className="btn-secondary" onClick={() => {
                    setEditingService(null);
                    setServiceForm({ name: '', price: '', duration: '', description: '' });
                  }}>
                    Отмена
                  </button>
                )}
              </div>
            </form>

            <div className="data-list">
              {services.map(service => (
                <div key={service.id} className="data-item">
                  <div className="item-info">
                    <strong>{service.name}</strong>
                    <span>{service.price} ₽ • {service.duration} мин</span>
                    {service.description && <small>{service.description}</small>}
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleEditService(service)} className="btn-edit">✏️</button>
                    <button onClick={() => handleDeleteService(service.id)} className="btn-delete">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && contactsForm && (
          <div className="tab-content">
            <h3>Редактирование контактов</h3>
            
            <form className="admin-form" onSubmit={handleContactsSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>📍 Адрес</label>
                  <input
                    type="text"
                    value={contactsForm.address || ''}
                    onChange={(e) => setContactsForm({...contactsForm, address: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Подпись адреса</label>
                  <input
                    type="text"
                    value={contactsForm.address_sub || ''}
                    onChange={(e) => setContactsForm({...contactsForm, address_sub: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>📞 Телефон</label>
                  <input
                    type="text"
                    value={contactsForm.phone || ''}
                    onChange={(e) => setContactsForm({...contactsForm, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Подпись телефона</label>
                  <input
                    type="text"
                    value={contactsForm.phone_sub || ''}
                    onChange={(e) => setContactsForm({...contactsForm, phone_sub: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>📧 Email</label>
                  <input
                    type="email"
                    value={contactsForm.email || ''}
                    onChange={(e) => setContactsForm({...contactsForm, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Подпись email</label>
                  <input
                    type="text"
                    value={contactsForm.email_sub || ''}
                    onChange={(e) => setContactsForm({...contactsForm, email_sub: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>🕐 Время работы</label>
                  <input
                    type="text"
                    value={contactsForm.work_hours || ''}
                    onChange={(e) => setContactsForm({...contactsForm, work_hours: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Подпись времени работы</label>
                  <input
                    type="text"
                    value={contactsForm.work_hours_sub || ''}
                    onChange={(e) => setContactsForm({...contactsForm, work_hours_sub: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                💾 Сохранить контакты
              </button>
            </form>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="tab-content">
            <h3>Управление галереей</h3>
            
            <form className="admin-form" onSubmit={handleGallerySubmit}>
              <h4>Добавить изображение</h4>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Название / описание"
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({...galleryForm, title: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="URL изображения (опционально)"
                  value={galleryForm.image_url}
                  onChange={(e) => setGalleryForm({...galleryForm, image_url: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Emoji-заглушка (например: 💅)"
                  value={galleryForm.placeholder}
                  onChange={(e) => setGalleryForm({...galleryForm, placeholder: e.target.value})}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                ➕ Добавить
              </button>
            </form>

            <div className="gallery-grid">
              {gallery.map(item => (
                <div key={item.id} className="gallery-item">
                  <div className="gallery-preview">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} />
                    ) : (
                      <span className="placeholder">{item.placeholder || '🖼️'}</span>
                    )}
                  </div>
                  <div className="gallery-info">
                    <strong>{item.title}</strong>
                    <small>Порядок: {item.sort_order}</small>
                  </div>
                  <button 
                    onClick={() => handleDeleteGalleryItem(item.id)} 
                    className="btn-delete"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="tab-content">
            <h3>Все записи</h3>
            
            <div className="bookings-list">
              {bookings.map(booking => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-info">
                    <strong>{booking.client_name}</strong>
                    <span>{booking.phone}</span>
                    <span>{booking.service_name} — {booking.service_price} ₽</span>
                    <span>{booking.date} в {booking.time}</span>
                  </div>
                  <div className="booking-actions">
                    <select
                      value={booking.status}
                      onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                      className={`status-${booking.status}`}
                    >
                      <option value="confirmed">✅ Подтверждено</option>
                      <option value="completed">✔️ Завершено</option>
                    </select>
                    <button 
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn-cancel"
                      title="Отменить бронирование"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <p className="empty">Записей пока нет</p>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-panel {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }
        .admin-header h2 {
          color: #E91E8C;
          font-size: 2rem;
          margin: 0;
        }
        .logout-btn {
          background: #f5f5f5;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          color: #666;
        }
        .logout-btn:hover { background: #eee; }
        
        .admin-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .admin-tabs button {
          padding: 12px 24px;
          border: 2px solid #f0f0f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .admin-tabs button:hover { border-color: #FF69B4; }
        .admin-tabs button.active {
          background: linear-gradient(135deg, #FF69B4, #E91E8C);
          color: white;
          border-color: transparent;
        }
        
        .alert {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          text-align: center;
        }
        .alert.error { background: #fee; color: #c00; }
        .alert.success { background: #efe; color: #060; }
        
        .admin-content { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .tab-content h3 { color: #333; margin-bottom: 24px; font-size: 1.5rem; }
        .tab-content h4 { color: #666; margin: 24px 0 16px; }
        
        .admin-form {
          background: #fafafa;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 32px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }
        .form-group { display: flex; flex-direction: column; }
        .form-group label { color: #666; margin-bottom: 6px; font-size: 0.9rem; }
        .admin-form input, .admin-form select {
          padding: 12px 14px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          width: 100%;
          box-sizing: border-box;
        }
        .admin-form input:focus, .admin-form select:focus {
          outline: none;
          border-color: #E91E8C;
        }
        .form-actions { display: flex; gap: 12px; }
        
        .btn-primary {
          background: linear-gradient(135deg, #FF69B4, #E91E8C);
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-primary:hover { opacity: 0.9; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary {
          background: #e0e0e0;
          color: #333;
          border: none;
          padding: 12px 28px;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
        }
        
        .data-list { display: flex; flex-direction: column; gap: 12px; }
        .data-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: white;
          border: 2px solid #f0f0f0;
          border-radius: 10px;
          transition: border-color 0.2s;
        }
        .data-item:hover { border-color: #FF69B4; }
        .item-info { display: flex; flex-direction: column; gap: 4px; }
        .item-info strong { color: #333; font-size: 1.1rem; }
        .item-info span { color: #666; font-size: 0.95rem; }
        .item-info small { color: #999; font-size: 0.85rem; }
        .item-actions { display: flex; gap: 8px; }
        .btn-edit, .btn-delete {
          background: #f5f5f5;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }
        .btn-edit:hover { background: #e0e0e0; }
        .btn-delete:hover { background: #ffebee; }
        
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .gallery-item {
          background: white;
          border: 2px solid #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }
        .gallery-preview {
          height: 150px;
          background: linear-gradient(135deg, #FFE4EF, #FFF);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gallery-preview img { width: 100%; height: 100%; object-fit: cover; }
        .gallery-preview .placeholder { font-size: 3rem; }
        .gallery-info {
          padding: 12px;
          text-align: center;
        }
        .gallery-info strong { color: #333; }
        .gallery-info small { display: block; color: #999; margin-top: 4px; }
        .gallery-item .btn-delete {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255,255,255,0.9);
        }
        
        .bookings-list { display: flex; flex-direction: column; gap: 12px; }
        .booking-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: white;
          border: 2px solid #f0f0f0;
          border-radius: 10px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .booking-info { display: flex; flex-direction: column; gap: 4px; }
        .booking-info strong { color: #333; font-size: 1.1rem; }
        .booking-info span { color: #666; font-size: 0.9rem; }
        .booking-status select {
          padding: 8px 12px;
          border-radius: 6px;
          border: 2px solid;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .booking-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .booking-actions select {
          padding: 8px 12px;
          border-radius: 6px;
          border: 2px solid;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .status-confirmed { border-color: #4caf50; background: #e8f5e9; color: #2e7d32; }
        .status-completed { border-color: #2196f3; background: #e3f2fd; color: #1565c0; }
        .btn-cancel {
          background: #ffebee;
          border: 2px solid #f44336;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .btn-cancel:hover {
          background: #f44336;
        }
        
        .empty { text-align: center; color: #999; padding: 40px; }
        
        @media (max-width: 600px) {
          .admin-tabs { flex-direction: column; }
          .admin-tabs button { text-align: center; }
          .form-grid { grid-template-columns: 1fr; }
          .booking-item { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
