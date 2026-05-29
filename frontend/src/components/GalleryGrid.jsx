import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

export default function GalleryGrid() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/gallery`);
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error('Error loading gallery:', err);
    }
    setLoading(false);
  };

  // Default items if gallery is empty
  const defaultItems = [
    { placeholder: "💅", title: "Классический маникюр" },
    { placeholder: "✨", title: "Гель-лак" },
    { placeholder: "💎", title: "Наращивание" },
    { placeholder: "🌟", title: "Френч" },
    { placeholder: "🎨", title: "Дизайн ногтей" },
    { placeholder: "✨", title: "Арт-маникюр" },
    { placeholder: "💎", title: "Свадебный маникюр" },
    { placeholder: "🌟", title: "Лунный маникюр" },
    { placeholder: "💅", title: "Градиент" },
    { placeholder: "✨", title: "Стразы" },
    { placeholder: "💎", title: "Френч" },
    { placeholder: "🌟", title: "Nail-art" }
  ];

  const displayItems = images.length > 0 
    ? images 
    : defaultItems;

  return (
    <div className="gallery-grid">
      {displayItems.map((item, index) => (
        <div key={item.id || index} className="gallery-item fade-in" style={{ animationDelay: `${(index % 4) * 0.1}s` }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} />
          ) : (
            <span className="gallery-placeholder">{item.placeholder}</span>
          )}
          <div className="gallery-overlay">
            <span>{item.title}</span>
          </div>
        </div>
      ))}

      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .gallery-item {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          aspect-ratio: 1;
          background: linear-gradient(135deg, #FFF5F8, #FFE4EF);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .gallery-placeholder {
          font-size: 4rem;
          opacity: 0.3;
          transition: all 0.3s ease;
        }
        .gallery-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }
        .gallery-item:hover .gallery-placeholder {
          transform: scale(1.1);
          opacity: 0.5;
        }
        .gallery-item:hover .gallery-overlay {
          transform: translateY(0);
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
