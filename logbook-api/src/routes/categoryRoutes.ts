import express from 'express';
import { categoryController } from '../controllers/categoryController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all categories
router.get('/', categoryController.getCategories);

// Get subcategories for a category
router.get('/subcategories/:categoryId', categoryController.getSubCategories);

// Add new category
router.post('/', categoryController.addCategory);

// Add new subcategory
router.post('/:categoryId/subcategories', categoryController.addSubCategory);

// Delete subcategory
router.delete('/subcategories/:subCategoryId', categoryController.deleteSubCategory);

// Delete category
router.delete('/:categoryId', categoryController.deleteCategory);

export default router; 