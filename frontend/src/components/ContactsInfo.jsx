import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

export default function ContactsInfo() {
  const [contacts, setContacts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/contacts`);
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  const contactItems = [
    { icon: "📍", title: "Адрес", value: contacts.address, sub: contacts.address_sub },
    { icon: "📞", title: "Телефон", value: contacts.phone, sub: contacts.phone_sub },
    { icon: "📧", title: "Email", value: contacts.email, sub: contacts.email_sub },
    { icon: "🕐", title: "Время работы", value: contacts.work_hours, sub: contacts.work_hours_sub }
  ];

  return (
    <div className="contact-grid">
      {contactItems.map((contact, index) => (
        <div key={contact.title} className="contact-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className="contact-icon">{contact.icon}</div>
          <h4>{contact.title}</h4>
          <p className="contact-value">{contact.value}</p>
          <p className="contact-sub">{contact.sub}</p>
        </div>
      ))}

      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 30px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .contact-card {
          background: white;
          padding: 40px 30px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(255, 105, 180, 0.1);
          transition: all 0.3s ease;
        }
        .contact-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 8px 40px rgba(255, 105, 180, 0.2);
        }
        .contact-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }
        .contact-card h4 {
          font-size: 1.3rem;
          color: #E91E8C;
          margin-bottom: 12px;
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .contact-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2D2D2D;
          margin-bottom: 8px;
        }
        .contact-sub {
          font-size: 0.9rem;
          color: #666;
        }
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.5s ease forwards;
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
