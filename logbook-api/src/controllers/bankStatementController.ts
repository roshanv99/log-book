import { Request, Response } from 'express';
import { extractTextFromPDF } from '../utils/pdfExtractor';
import { formatTransactionsWithGPT } from '../utils/gptFormatter';
import UserModel from '../models/User';

export const processBankStatement = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (!req.user?.userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Get user's monthly_start_date
        const user = await UserModel.findById(parseInt(req.user.userId));
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.monthly_start_date) {
            return res.status(400).json({ message: 'monthly_start_date not set for user' });
        }

        const pdfBuffer = req.file.buffer;
        const extractedText = await extractTextFromPDF(pdfBuffer);
        console.log('Extracted text:', extractedText);
        // Format the extracted text using GPT
        const formattedTransactions = await formatTransactionsWithGPT(
            extractedText,
            1, // Default currency_id for INR
            req.user.userId,
            user.monthly_start_date
        );
        res.status(200).json({ 
            message: 'Bank statement processed successfully',
            transactions: formattedTransactions
        });
    } catch (error) {
        console.error('Error processing bank statement:', error);
        res.status(500).json({ 
            message: 'Failed to process bank statement',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}; 