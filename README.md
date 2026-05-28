# GLAM nails — Маникюрный салон

Яркий гламурный сайт для маникюрного салона с онлайн-записью.

## 🏗️ Архитектура

- **Frontend**: Astro (статический генератор сайтов) + React (для интерактивных компонентов)
- **Backend**: Node.js + Express API
- **База данных**: SQLite

## 📁 Структура проекта

```
/workspace/project/
├── frontend/           # Astro frontend
│   ├── src/
│   │   ├── components/  # React компоненты (бронирование)
│   │   ├── layouts/    # Astro layouts
│   │   └── pages/     # Страницы сайта
│   └── package.json
├── backend/            # Express API сервер
│   ├── src/
│   │   ├── db/        # SQLite база данных
│   │   └── routes/    # API routes
│   └── package.json
├── package.json       # Корень монорепозитория
└── README.md
```

## 🚀 Запуск

### Backend
```bash
cd backend
npm install
npm start        # Запуск сервера на порту 3001
npm run dev     # Запуск с hot-reload
npm test        # Запуск тестов
```

### Frontend
```bash
cd frontend
npm install
npm run dev     # Запуск dev сервера
npm run build   # Сборка для production
```

## 🌐 API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/services` | Получить список услуг |
| GET | `/api/available-slots?date=YYYY-MM-DD` | Получить свободные слоты |
| POST | `/api/bookings` | Создать бронирование |
| GET | `/api/bookings/:id` | Получить бронирование по ID |
| GET | `/health` | Проверка здоровья сервера |

## 📱 Страницы

- `/` — Главная страница
- `/services` — Услуги
- `/price` — Прайс-лист
- `/gallery` — Галерея работ
- `/contacts` — Контакты
- `/booking` — Онлайн-запись

## 🎨 Дизайн

- Цветовая палитра: розовый (#FF69B4), золотой (#FFD700), белый
- Типографика: Cormorant Garamond (заголовки), Montserrat (текст)
- Адаптивный дизайн для мобильных устройств
- Плавные анимации и hover-эффекты

## 📦 Deploy

### Frontend
- Netlify / Vercel / GitHub Pages

### Backend
- Render.com (бесплатно до 750ч/месяц)

## 📝 Лицензия

ISC
