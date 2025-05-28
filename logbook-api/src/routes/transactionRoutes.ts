import express from 'express';
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getUserTransactionsForCurrentPeriod,
  getCategoryAggregatesForCurrentPeriod,
  upsertIncomeForCurrentPeriod,
  updateTransactionsCategory,
  updateTransactionsSubCategory
} from '../controllers/transactionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, addTransaction);
router.put('/:id', authMiddleware, updateTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);
router.get('/current-period', authMiddleware, getUserTransactionsForCurrentPeriod);
router.get('/category-aggregates', authMiddleware, getCategoryAggregatesForCurrentPeriod);
router.post('/income', authMiddleware, upsertIncomeForCurrentPeriod);
router.post('/update-category', authMiddleware, updateTransactionsCategory);
router.post('/update-subcategory', authMiddleware, updateTransactionsSubCategory);

export default router; 