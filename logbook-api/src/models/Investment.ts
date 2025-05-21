import { RowDataPacket } from 'mysql2';

export interface Investment extends RowDataPacket {
  investment_id: number;
  investment_date: string;
  type: string;
  name: string;
  amount: number;
  currency_id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentInput {
  investment_date: string;
  type: string;
  name: string;
  amount: number;
  currency_id: number;
  user_id: string;
}

export interface InvestmentUpdateInput extends Partial<InvestmentInput> {}

export type InvestmentType = 'Mutual Funds' | 'Stocks' | 'Fixed Deposits' | 'Chit Fund'; 