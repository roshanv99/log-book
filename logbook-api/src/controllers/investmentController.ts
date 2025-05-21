import { Request, Response } from 'express';
import investmentService from '../services/investmentService';

class InvestmentController {
  async getInvestments(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const investments = await investmentService.getInvestments(userId);
      res.json(investments);
    } catch (error) {
      console.error('Error fetching investments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async addInvestment(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { investment_date, type, name, amount, currency_id } = req.body;

      if (!investment_date || !type || !name || !amount || !currency_id) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const investment = await investmentService.addInvestment({
        investment_date,
        type,
        name,
        amount,
        currency_id,
        user_id: userId
      });

      res.status(201).json(investment);
    } catch (error) {
      console.error('Error adding investment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateInvestment(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.params;
      const { investment_date, type, name, amount, currency_id } = req.body;

      await investmentService.updateInvestment(Number(id), {
        investment_date,
        type,
        name,
        amount,
        currency_id
      });

      res.status(200).json({ message: 'Investment updated successfully' });
    } catch (error) {
      console.error('Error updating investment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteInvestment(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.params;
      await investmentService.deleteInvestment(Number(id));

      res.status(200).json({ message: 'Investment deleted successfully' });
    } catch (error) {
      console.error('Error deleting investment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new InvestmentController(); 