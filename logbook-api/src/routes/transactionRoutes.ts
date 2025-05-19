import express from 'express';
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getUserTransactionsForCurrentPeriod
} from '../controllers/transactionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, addTransaction);
router.put('/:id', authMiddleware, updateTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);
router.get('/current-period', authMiddleware, getUserTransactionsForCurrentPeriod);

export default router; 