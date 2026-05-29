import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

export default function PriceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/services`);
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error('Error loading services:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Загрузка цен...</div>;
  }

  // Group services by first word (category heuristic)
  const categories = {};
  services.forEach(service => {
    const words = service.name.split(' ');
    const category = words[0];
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(service);
  });

  return (
    <div className="price-tables">
      {Object.entries(categories).map(([category, categoryServices], index) => (
        <div key={category} className="price-table-section fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <h2 className="table-title">{category}</h2>
          <div className="price-table">
            {categoryServices.map((service) => (
              <div key={service.id} className="price-row">
                <div className="price-details">
                  <span className="service-name">{service.name}</span>
                  <span className="service-duration">{service.duration} мин</span>
                </div>
                <span className="service-price">{service.price} ₽</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <style>{`
        .price-tables {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .price-table-section {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(255, 105, 180, 0.15);
        }
        .table-title {
          background: linear-gradient(135deg, #FF69B4, #E91E8C);
          color: white;
          padding: 20px 30px;
          font-size: 1.5rem;
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .price-table {
          padding: 10px 0;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 30px;
          border-bottom: 1px solid rgba(255, 105, 180, 0.1);
          transition: background 0.3s ease;
        }
        .price-row:hover {
          background: #FFF5F8;
        }
        .price-row:last-child {
          border-bottom: none;
        }
        .price-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .service-name {
          font-weight: 500;
          color: #2D2D2D;
        }
        .service-duration {
          font-size: 0.85rem;
          color: #666;
        }
        .service-price {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: #FFD700;
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
