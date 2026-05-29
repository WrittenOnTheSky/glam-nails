import { Router } from 'express';
import { 
  getGalleryImages, 
  addGalleryImage, 
  updateGalleryImage, 
  deleteGalleryImage 
} from '../db/database.js';

const router = Router();

// GET /api/gallery - Get all gallery images
router.get('/', (req, res) => {
  try {
    const images = getGalleryImages();
    res.json(images);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// POST /api/gallery - Add new image
router.post('/', (req, res) => {
  try {
    const { title, image_url, placeholder } = req.body;
    
    if (!title || title.trim().length < 1) {
      return res.status(400).json({ error: 'Укажите название изображения' });
    }
    
    const image = addGalleryImage({ title, image_url, placeholder });
    res.status(201).json(image);
  } catch (error) {
    console.error('Error adding gallery image:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// PUT /api/gallery/:id - Update image
router.put('/:id', (req, res) => {
  try {
    const { title, image_url, placeholder, sort_order } = req.body;
    
    const image = updateGalleryImage(req.params.id, { title, image_url, placeholder, sort_order });
    if (!image) {
      return res.status(404).json({ error: 'Изображение не найдено' });
    }
    res.json(image);
  } catch (error) {
    console.error('Error updating gallery image:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// DELETE /api/gallery/:id - Delete image
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteGalleryImage(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Изображение не найдено' });
    }
    res.json({ success: true, message: 'Изображение удалено' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;
