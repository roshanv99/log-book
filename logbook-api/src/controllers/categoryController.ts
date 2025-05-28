import { Request, Response } from 'express';
import pool from '../config/db';
import categoryService from '../services/categoryService';

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       500:
 *         description: Server error
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await pool.query('SELECT * FROM categories ORDER BY category_name');
    res.json(categories.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

/**
 * @swagger
 * /subcategories/{categoryId}:
 *   get:
 *     summary: Get subcategories for a category
 *     tags: [SubCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Subcategories retrieved successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
export const getSubCategories = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const subCategories = await pool.query(
      'SELECT * FROM sub_categories WHERE category_id = $1 ORDER BY sub_category_name',
      [categoryId]
    );
    res.json(subCategories.rows);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Error fetching subcategories' });
  }
};

export const categoryController = {
  // Get all categories
  async getCategories(req: Request, res: Response) {
    try {
      console.log('Attempting to fetch categories...');
      const categories = await categoryService.getCategories();
      console.log('Categories fetched:', categories);
      res.json(categories);
    } catch (error) {
      console.error('Detailed error fetching categories:', error);
      res.status(500).json({ 
        message: 'Error fetching categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get subcategories for a category
  async getSubCategories(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const subCategories = await categoryService.getSubCategories(Number(categoryId));
      res.json(subCategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      res.status(500).json({ message: 'Error fetching subcategories' });
    }
  },

  // Add new category
  async addCategory(req: Request, res: Response) {
    try {
      const { category_name } = req.body;
      
      if (!category_name) {
        return res.status(400).json({ message: 'Category name is required' });
      }

      // Check if category already exists
      const existingCategory = await pool.query(
        'SELECT * FROM categories WHERE category_name = $1',
        [category_name]
      );

      if (existingCategory.rows.length > 0) {
        return res.status(400).json({ message: 'Category already exists' });
      }

      const result = await pool.query(
        'INSERT INTO categories (category_name) VALUES ($1) RETURNING *',
        [category_name]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding category:', error);
      res.status(500).json({ message: 'Error adding category' });
    }
  },

  // Add new subcategory
  async addSubCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const { sub_category_name } = req.body;

      if (!sub_category_name) {
        return res.status(400).json({ message: 'Subcategory name is required' });
      }

      // Check if category exists
      const category = await pool.query(
        'SELECT * FROM categories WHERE category_id = $1',
        [categoryId]
      );

      if (category.rows.length === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Check if subcategory already exists under this category
      const existingSubCategory = await pool.query(
        'SELECT * FROM sub_categories WHERE category_id = $1 AND sub_category_name = $2',
        [categoryId, sub_category_name]
      );

      if (existingSubCategory.rows.length > 0) {
        return res.status(400).json({ message: 'Subcategory already exists under this category' });
      }

      const result = await pool.query(
        'INSERT INTO sub_categories (category_id, sub_category_name) VALUES ($1, $2) RETURNING *',
        [categoryId, sub_category_name]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding subcategory:', error);
      res.status(500).json({ message: 'Error adding subcategory' });
    }
  },

  // Delete subcategory
  async deleteSubCategory(req: Request, res: Response) {
    try {
      const { subCategoryId } = req.params;
      await categoryService.deleteSubCategory(Number(subCategoryId));
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error deleting subcategory' });
      }
    }
  },

  // Delete category
  async deleteCategory(req: Request, res: Response) {
    try {
      console.log('Attempting to delete category...');
      const { categoryId } = req.params;
      console.log('Category ID to delete:', categoryId);

      // Check if category exists
      console.log('Checking if category exists...');
      const categoryResult = await pool.query(
        'SELECT * FROM categories WHERE category_id = $1',
        [categoryId]
      );
      console.log('Category query result:', categoryResult);

      if (categoryResult.rows.length === 0) {
        console.log('Category not found');
        return res.status(404).json({ message: 'Category not found' });
      }
      console.log('Category found:', categoryResult.rows[0]);

      // Use categoryService to delete the category
      await categoryService.deleteCategory(Number(categoryId));
      console.log('Category deleted successfully');
      res.status(204).send();
    } catch (error) {
      console.error('Detailed error deleting category:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      res.status(500).json({ 
        message: 'Error deleting category',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}; 