import { Request, Response } from 'express';
import pool from '../config/db';

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
    const result = await pool.query('SELECT * FROM categories ORDER BY category_name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
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
export const getSubCategoriesByCategoryId = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const result = await pool.query(
      'SELECT * FROM sub_categories WHERE category_id = $1 ORDER BY sub_category_name ASC',
      [categoryId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({ message: 'Failed to fetch subcategories' });
  }
}; 