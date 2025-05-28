import { Request, Response } from 'express';
import transactionService from '../services/transactionService';

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
    const transaction = await transactionService.addTransaction(req.body);
    res.status(201).json({ transaction });
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
    const transaction = await transactionService.updateTransaction(Number(id), req.body);
    res.json({ transaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    if (error instanceof Error && error.message === 'Transaction not found') {
      return res.status(404).json({ message: error.message });
    }
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
    const transaction = await transactionService.deleteTransaction(Number(id));
    res.json({ message: 'Transaction deleted', transaction });
  } catch (error) {
    console.error('Delete transaction error:', error);
    if (error instanceof Error && error.message === 'Transaction not found') {
      return res.status(404).json({ message: error.message });
    }
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
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const transactions = await transactionService.getUserTransactionsForCurrentPeriod(userId);
    res.json({ transactions });
  } catch (error) {
    console.error('Get user transactions error:', error);
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'monthly_start_date not set for user') {
        return res.status(400).json({ message: error.message });
      }
    }
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

/**
 * @swagger
 * /transactions/category-aggregates:
 *   get:
 *     summary: Get aggregated amounts by category for the current period
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category aggregates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 aggregates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category_id:
 *                         type: integer
 *                       category_name:
 *                         type: string
 *                       total_amount:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       400:
 *         description: monthly_start_date not set for user
 *       500:
 *         description: Server error
 */
export const getCategoryAggregatesForCurrentPeriod = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const aggregates = await transactionService.getCategoryAggregatesForCurrentPeriod(userId);
    res.json({ aggregates });
  } catch (error) {
    console.error('Get category aggregates error:', error);
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'monthly_start_date not set for user') {
        return res.status(400).json({ message: error.message });
      }
    }
    res.status(500).json({ message: 'Failed to fetch category aggregates' });
  }
};

export const upsertIncomeForCurrentPeriod = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { amount } = req.body;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (typeof amount !== 'number' || isNaN(amount)) {
      return res.status(400).json({ message: 'Amount is required and must be a number' });
    }
    await transactionService.upsertIncomeForCurrentPeriod(userId, amount);
    res.status(200).json({ message: 'Income saved for current period' });
  } catch (error) {
    console.error('Upsert income error:', error);
    if (error instanceof Error && error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error instanceof Error && error.message === 'monthly_start_date not set for user') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to save income' });
  }
};

export const updateTransactionsCategory = async (req: Request, res: Response) => {
  try {
    const { oldCategoryId, newCategoryId } = req.body;
    if (!oldCategoryId || !newCategoryId) {
      return res.status(400).json({ message: 'Both oldCategoryId and newCategoryId are required' });
    }
    await transactionService.updateTransactionsCategory(oldCategoryId, newCategoryId);
    res.json({ message: 'Transactions updated successfully' });
  } catch (error) {
    console.error('Update transactions category error:', error);
    res.status(500).json({ message: 'Failed to update transactions' });
  }
};

export const updateTransactionsSubCategory = async (req: Request, res: Response) => {
  try {
    const { subCategoryId } = req.body;
    if (!subCategoryId) {
      return res.status(400).json({ message: 'subCategoryId is required' });
    }
    await transactionService.updateTransactionsSubCategory(subCategoryId);
    res.json({ message: 'Transactions updated successfully' });
  } catch (error) {
    console.error('Update transactions subcategory error:', error);
    res.status(500).json({ message: 'Failed to update transactions' });
  }
}; 