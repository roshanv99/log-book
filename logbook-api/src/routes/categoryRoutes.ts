import express from 'express';
import { getCategories, getSubCategoriesByCategoryId } from '../controllers/categoryController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware, getCategories);
router.get('/subcategories/:categoryId', authMiddleware, getSubCategoriesByCategoryId);

export default router; 