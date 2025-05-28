import express from 'express';
import multer from 'multer';
import { processBankStatement } from '../controllers/bankStatementController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Process bank statement PDF
router.post('/process', authMiddleware, upload.single('bankStatement'), processBankStatement);

export default router; 