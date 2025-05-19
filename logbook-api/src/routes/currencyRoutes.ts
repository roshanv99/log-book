import express from 'express';
import { getCurrencies } from '../controllers/currencyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware, getCurrencies);

export default router; 