import { Request, Response } from 'express';
import pool from '../config/db';

/**
 * @swagger
 * /currencies:
 *   get:
 *     summary: Get all currencies
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Currencies retrieved successfully
 *       500:
 *         description: Server error
 */
export const getCurrencies = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM currencies ORDER BY currency_name ASC');
    res.json({ currencies: result.rows });
  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(500).json({ message: 'Failed to fetch currencies' });
  }
}; 