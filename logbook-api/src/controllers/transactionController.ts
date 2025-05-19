import { Request, Response } from 'express';
import pool from '../config/db';

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Add a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transaction_date:
 *                 type: string
 *                 format: date
 *               category_id:
 *                 type: integer
 *               sub_category_id:
 *                 type: integer
 *               transaction_name:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency_id:
 *                 type: integer
 *               seller_name:
 *                 type: string
 *               discount_amount:
 *                 type: number
 *               discount_origin:
 *                 type: string
 *               comments:
 *                 type: string
 *               transaction_type:
 *                 type: integer
 *               is_income:
 *                 type: integer
 *             required:
 *               - transaction_date
 *               - category_id
 *               - amount
 *               - currency_id
 *     responses:
 *       201:
 *         description: Transaction added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
export const addTransaction = async (req: Request, res: Response) => {
  try {
    const {
      transaction_date,
      category_id,
      sub_category_id,
      transaction_name,
      amount,
      currency_id,
      seller_name,
      discount_amount,
      discount_origin,
      comments,
      user_id,
      transaction_type,
      is_income
    } = req.body;

    const result = await pool.query(
      `INSERT INTO transactions (
        transaction_date, category_id, sub_category_id, transaction_name, amount, currency_id,
        seller_name, discount_amount, discount_origin, comments, user_id, transaction_type, is_income
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      ) RETURNING *`,
      [
        transaction_date, category_id, sub_category_id, transaction_name, amount, currency_id,
        seller_name, discount_amount, discount_origin, comments, user_id, transaction_type, is_income
      ]
    );
    res.status(201).json({ transaction: result.rows[0] });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ message: 'Failed to add transaction' });
  }
};

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     summary: Update a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transaction_date:
 *                 type: string
 *                 format: date
 *               category_id:
 *                 type: integer
 *               sub_category_id:
 *                 type: integer
 *               transaction_name:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency_id:
 *                 type: integer
 *               seller_name:
 *                 type: string
 *               discount_amount:
 *                 type: number
 *               discount_origin:
 *                 type: string
 *               comments:
 *                 type: string
 *               transaction_type:
 *                 type: integer
 *               is_income:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      transaction_date,
      category_id,
      sub_category_id,
      transaction_name,
      amount,
      currency_id,
      seller_name,
      discount_amount,
      discount_origin,
      comments,
      user_id,
      transaction_type,
      is_income
    } = req.body;

    const result = await pool.query(
      `UPDATE transactions SET
        transaction_date = $1,
        category_id = $2,
        sub_category_id = $3,
        transaction_name = $4,
        amount = $5,
        currency_id = $6,
        seller_name = $7,
        discount_amount = $8,
        discount_origin = $9,
        comments = $10,
        user_id = $11,
        transaction_type = $12,
        is_income = $13,
        updated_at = NOW()
      WHERE transaction_id = $14
      RETURNING *`,
      [
        transaction_date, category_id, sub_category_id, transaction_name, amount, currency_id,
        seller_name, discount_amount, discount_origin, comments, user_id, transaction_type, is_income, id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ transaction: result.rows[0] });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Failed to update transaction' });
  }
};

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM transactions WHERE transaction_id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted', transaction: result.rows[0] });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
};

/**
 * @swagger
 * /transactions/current-period:
 *   get:
 *     summary: Get user transactions for the current period
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       500:
 *         description: Server error
 */
export const getUserTransactionsForCurrentPeriod = async (req: Request, res: Response) => {
  try {
    // Get userId from auth middleware
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user's monthly_start_date
    const userResult = await pool.query(
      'SELECT monthly_start_date FROM users WHERE user_id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const monthlyStartDate = userResult.rows[0].monthly_start_date;
    if (!monthlyStartDate) {
      return res.status(400).json({ message: 'monthly_start_date not set for user' });
    }

    // Calculate the start date in SQL
    // The logic:
    // - If monthly_start_date > today, use previous month (and fallback to last day if needed)
    // - Else, use this month
    // We'll use PostgreSQL date functions for this
    const transactionsResult = await pool.query(`
      SELECT * FROM transactions
      WHERE user_id = $1
        AND transaction_date >= (
          CASE
            WHEN $2 > EXTRACT(DAY FROM CURRENT_DATE)
              THEN
                -- Previous month, fallback to last day if needed
                ((DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::date
                 - ((EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'))::int - LEAST($2, EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'))::int)) * INTERVAL '1 day'))
              ELSE
                -- This month
                (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '$2 day' - INTERVAL '1 day')::date
          END
        )
        AND transaction_date <= CURRENT_DATE
      ORDER BY transaction_date DESC
    `, [userId, monthlyStartDate]);

    res.json({ transactions: transactionsResult.rows });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
}; 