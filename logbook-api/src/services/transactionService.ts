import pool from '../config/db';
import { Transaction, TransactionInput, TransactionUpdateInput } from '../models/Transaction';

class TransactionService {
  async addTransaction(transaction: TransactionInput): Promise<Transaction> {
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
    } = transaction;

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
    return result.rows[0];
  }

  async updateTransaction(id: number, transaction: TransactionUpdateInput): Promise<Transaction> {
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
    } = transaction;

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
      throw new Error('Transaction not found');
    }
    return result.rows[0];
  }

  async deleteTransaction(id: number): Promise<Transaction> {
    const result = await pool.query(
      'DELETE FROM transactions WHERE transaction_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Transaction not found');
    }
    return result.rows[0];
  }

  async getUserTransactionsForCurrentPeriod(userId: string): Promise<Transaction[]> {
    // Get user's monthly_start_date
    const userResult = await pool.query(
      'SELECT monthly_start_date FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const monthlyStartDate = userResult.rows[0].monthly_start_date;
    if (!monthlyStartDate) {
      throw new Error('monthly_start_date not set for user');
    }

    // Calculate the start date in SQL
    const transactionsResult = await pool.query(`
      SELECT * FROM transactions
      WHERE user_id = $1
        AND transaction_date >= (
          CASE
            WHEN $2 > EXTRACT(DAY FROM CURRENT_DATE)
              THEN
                -- Previous month
                DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date
              ELSE
                -- This month
                DATE_TRUNC('month', CURRENT_DATE)::date
          END
        )
        AND transaction_date <= CURRENT_DATE
      ORDER BY transaction_date DESC
    `, [userId, monthlyStartDate]);
    return transactionsResult.rows;
  }

  async getCategoryAggregatesForCurrentPeriod(userId: string): Promise<{ category_id: number; category_name: string; total_amount: number }[]> {
    // Get user's monthly_start_date
    const userResult = await pool.query(
      'SELECT monthly_start_date FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const monthlyStartDate = userResult.rows[0].monthly_start_date;
    if (!monthlyStartDate) {
      throw new Error('monthly_start_date not set for user');
    }

    // Calculate the start date in SQL and get aggregated amounts by category
    const result = await pool.query(`
      SELECT 
        t.category_id,
        c.category_name,
        SUM(CASE 
          WHEN t.transaction_type = 0 THEN t.amount 
          WHEN t.transaction_type = 1 THEN -t.amount 
          ELSE 0 
        END) as total_amount
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.user_id = $1
        AND c.category_name != 'Income'
        AND t.transaction_date >= (
          CASE
            WHEN $2 > EXTRACT(DAY FROM CURRENT_DATE)
              THEN
                -- Previous month
                DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date
              ELSE
                -- This month
                DATE_TRUNC('month', CURRENT_DATE)::date
          END
        )
        AND t.transaction_date <= CURRENT_DATE
      GROUP BY t.category_id, c.category_name
      ORDER BY total_amount DESC
    `, [userId, monthlyStartDate]);

    return result.rows;
  }

  async upsertIncomeForCurrentPeriod(userId: string, amount: number): Promise<void> {
    // Get user's monthly_start_date
    const userResult = await pool.query(
      'SELECT monthly_start_date FROM users WHERE user_id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    const monthlyStartDate = userResult.rows[0].monthly_start_date;
    if (!monthlyStartDate) {
      throw new Error('monthly_start_date not set for user');
    }

    // Calculate the period start date
    const periodStartResult = await pool.query(
      `SELECT
        (CASE
          WHEN $1 > EXTRACT(DAY FROM CURRENT_DATE)
            THEN ((DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::date
                  - ((EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'))::int - LEAST($1, EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'))::int)) * INTERVAL '1 day'))
          ELSE (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '$1 day' - INTERVAL '1 day')::date
        END) AS period_start`,
      [monthlyStartDate]
    );
    const periodStart = periodStartResult.rows[0].period_start;

    // Check if an income transaction exists for this period
    const checkResult = await pool.query(
      `SELECT transaction_id FROM transactions
       WHERE user_id = $1
         AND is_income = 1
         AND transaction_date = $2
       LIMIT 1`,
      [userId, periodStart]
    );

    if (checkResult.rows.length > 0) {
      // Update existing income transaction
      const transactionId = checkResult.rows[0].transaction_id;
      await pool.query(
        'UPDATE transactions SET amount = $1, transaction_date = $2, updated_at = NOW() WHERE transaction_id = $3',
        [amount, periodStart, transactionId]
      );
    } else {
      const catRes = await pool.query(
        "SELECT category_id FROM categories WHERE category_name = 'Income'"
      );
      const incomeCategoryId = catRes.rows[0].category_id;

      // Insert new income transaction
      await pool.query(
        `INSERT INTO transactions (
          transaction_date, category_id, sub_category_id, transaction_name, amount, currency_id,
          seller_name, discount_amount, discount_origin, comments, user_id, transaction_type, is_income
        ) VALUES (
          $1, $4, NULL, 'Income', $2, 1, '', 0, '', '', $3, 0, 1
        )`,
        [periodStart, amount, userId, incomeCategoryId]
      );
    }
  }
}

export default new TransactionService();
