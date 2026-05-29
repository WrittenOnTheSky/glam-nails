import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

export default function Footer() {
  const [contacts, setContacts] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/contacts`);
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      // Use defaults on error
      setContacts({
        address: 'ул. Красивая, 15',
        phone: '+7 (999) 123-45-67',
        work_hours: '10:00 - 20:00'
      });
    }
  };

  const displayContacts = contacts || {
    address: 'ул. Красивая, 15',
    phone: '+7 (999) 123-45-67',
    work_hours: '10:00 - 20:00'
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo">GLAM<span>nails</span></span>
            <p>Салон маникюра премиум-класса в самом сердце города</p>
          </div>
          <div className="footer-info">
            <h4>Контакты</h4>
            <p>📍 {displayContacts.address}</p>
            <p>📞 {displayContacts.phone}</p>
            <p>🕐 {displayContacts.work_hours}</p>
          </div>
          <div className="footer-links">
            <h4>Навигация</h4>
            <a href="/services">Услуги</a>
            <a href="/price">Прайс-лист</a>
            <a href="/gallery">Галерея</a>
            <a href="/booking">Онлайн-запись</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 GLAM nails. Все права защищены.</p>
        </div>
      </div>

      <style>{`
        .footer {
          background: linear-gradient(135deg, #E91E8C, #C4177A);
          color: white;
          padding: 80px 24px 30px;
          margin-top: auto;
        }
        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 50px;
          max-width: 1200px;
          margin: 0 auto 50px;
        }
        .footer-logo .logo {
          font-size: 2rem;
          color: white;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 700;
        }
        .footer-logo .logo span {
          color: #FFD700;
        }
        .footer-logo p {
          margin-top: 16px;
          opacity: 0.8;
          font-size: 0.95rem;
        }
        .footer h4 {
          font-size: 1.2rem;
          margin-bottom: 20px;
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .footer-info p, .footer-links a {
          display: block;
          opacity: 0.8;
          margin-bottom: 10px;
          transition: opacity 0.3s ease;
        }
        .footer-links a:hover {
          opacity: 1;
        }
        .footer-bottom {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 0.9rem;
          opacity: 0.7;
        }
      `}</style>
    </footer>
  );
}
