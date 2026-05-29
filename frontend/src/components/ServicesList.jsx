import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

export default function ServicesList() {
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

  // Define categories with icons
  const categories = {
    'Классический': { icon: '💅', name: 'Маникюр', desc: 'Профессиональный маникюр любой сложности' },
    'Аппаратный': { icon: '💅', name: 'Аппаратный маникюр', desc: 'Маникюр с использованием фрез' },
    'Комбинированный': { icon: '💅', name: 'Комбинированный', desc: 'Комбинация техник маникюра' },
    'Гель': { icon: '✨', name: 'Покрытие гель-лаком', desc: 'Идеальное покрытие на долгое время' },
    'Френч': { icon: '🌟', name: 'Французский маникюр', desc: 'Классический френч' },
    'Лунный': { icon: '🌟', name: 'Лунный маникюр', desc: 'Лунный дизайн' },
    'Градиент': { icon: '🎨', name: 'Градиент/омбре', desc: 'Плавные цветовые переходы' },
    'Наращивание': { icon: '💎', name: 'Наращивание', desc: 'Красивые и прочные ногти' },
    'Коррекция': { icon: '💎', name: 'Коррекция', desc: 'Коррекция наращенных ногтей' },
    'Дизайн': { icon: '🎨', name: 'Дизайн ногтей', desc: 'Уникальный nail-art' },
    'Стразы': { icon: '💎', name: 'Стразы', desc: 'Украшение стразами' },
    'Парафин': { icon: '🧴', name: 'Парафинотерапия', desc: 'Уход за руками' },
    'Снятие': { icon: '✨', name: 'Снятие покрытия', desc: 'Удаление гель-лака' },
  };

  if (loading) {
    return <div className="loading">Загрузка услуг...</div>;
  }

  // Group services by category
  const groupedServices = {};
  services.forEach(service => {
    const firstWord = service.name.split(' ')[0];
    let categoryKey = 'Другие';
    
    for (const key of Object.keys(categories)) {
      if (service.name.includes(key)) {
        categoryKey = key;
        break;
      }
    }
    
    if (!groupedServices[categoryKey]) {
      groupedServices[categoryKey] = [];
    }
    groupedServices[categoryKey].push(service);
  });

  return (
    <div className="services-list">
      {Object.entries(groupedServices).map(([categoryKey, categoryServices], index) => {
        const categoryInfo = categories[categoryKey] || { icon: '✨', name: categoryKey, desc: '' };
        
        return (
          <div key={categoryKey} className="service-category fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="category-header">
              <span className="category-icon">{categoryInfo.icon}</span>
              <div>
                <h2>{categoryInfo.name}</h2>
                <p>{categoryInfo.desc}</p>
              </div>
            </div>
            <div className="category-grid">
              {categoryServices.map((service) => (
                <div key={service.id} className="option-card">
                  <div className="option-info">
                    <h4>{service.name}</h4>
                    {service.description && <span className="option-desc">{service.description}</span>}
                    <span className="option-duration">{service.duration} мин</span>
                  </div>
                  <div className="option-price">{service.price} ₽</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <style>{`
        .services-list {
          max-width: 1000px;
          margin: 0 auto;
        }
        .service-category {
          max-width: 1000px;
          margin: 0 auto 60px;
        }
        .category-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid rgba(255, 105, 180, 0.2);
        }
        .category-icon {
          font-size: 3rem;
        }
        .category-header h2 {
          font-size: 1.8rem;
          color: #E91E8C;
          margin-bottom: 4px;
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .category-header p {
          color: #666;
        }
        .category-grid {
          display: grid;
          gap: 16px;
        }
        .option-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(255, 105, 180, 0.1);
          transition: all 0.3s ease;
        }
        .option-card:hover {
          transform: translateX(10px);
          box-shadow: 0 4px 20px rgba(255, 105, 180, 0.15);
        }
        .option-info {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .option-info h4 {
          font-weight: 500;
          font-size: 1rem;
          color: #2D2D2D;
        }
        .option-desc {
          font-size: 0.85rem;
          color: #666;
          width: 100%;
          margin-top: 4px;
        }
        .option-duration {
          font-size: 0.85rem;
          color: #666;
          background: #FFF5F8;
          padding: 4px 12px;
          border-radius: 20px;
        }
        .option-price {
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
        @media (max-width: 600px) {
          .option-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .option-info {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
