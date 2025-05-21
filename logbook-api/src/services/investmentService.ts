import { Pool } from 'pg';
import { Investment, InvestmentInput, InvestmentUpdateInput } from '../models/investment';
import pool from '../config/db';

class InvestmentService {
  async getInvestments(userId: string): Promise<Investment[]> {
    const query = 'SELECT * FROM investments WHERE user_id = $1 ORDER BY investment_date DESC';
    const result = await pool.query(query, [userId]);
    return result.rows as Investment[];
  }

  async addInvestment(investment: InvestmentInput): Promise<Investment> {
    const query = `
      INSERT INTO investments (investment_date, type, name, amount, currency_id, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      investment.investment_date,
      investment.type,
      investment.name,
      investment.amount,
      investment.currency_id,
      investment.user_id
    ];
    const result = await pool.query(query, values);
    return result.rows[0] as Investment;
  }

  async updateInvestment(id: number, investment: InvestmentUpdateInput): Promise<void> {
    const fields = Object.keys(investment)
      .filter(key => key !== 'investment_id' && key !== 'created_at' && key !== 'updated_at')
      .map((key, index) => `${key} = $${index + 1}`);
    const values = Object.values(investment).filter(value => value !== undefined);
    
    const query = `UPDATE investments SET ${fields.join(', ')} WHERE investment_id = $${values.length + 1}`;
    await pool.query(query, [...values, id]);
  }

  async deleteInvestment(id: number): Promise<void> {
    const query = 'DELETE FROM investments WHERE investment_id = $1';
    await pool.query(query, [id]);
  }
}

export default new InvestmentService(); 