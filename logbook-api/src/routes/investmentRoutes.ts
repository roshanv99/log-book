import { Router } from 'express';
import investmentController from '../controllers/investmentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All routes are protected with authentication
router.use(authMiddleware);

// Get all investments for the authenticated user
router.get('/', investmentController.getInvestments);

// Add a new investment
router.post('/', investmentController.addInvestment);

// Update an investment
router.put('/:id', investmentController.updateInvestment);

// Delete an investment
router.delete('/:id', investmentController.deleteInvestment);

export default router; 