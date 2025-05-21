export interface Transaction {
  transaction_id: number;
  transaction_date: Date;
  category_id: number;
  sub_category_id: number | null;
  transaction_name: string;
  amount: number;
  currency_id: number;
  seller_name: string | null;
  discount_amount: number | null;
  discount_origin: string | null;
  comments: string | null;
  transaction_type: number;
  is_income: number;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionInput {
  transaction_date: Date;
  category_id: number;
  sub_category_id?: number;
  transaction_name: string;
  amount: number;
  currency_id: number;
  seller_name?: string;
  discount_amount?: number;
  discount_origin?: string;
  comments?: string;
  transaction_type: number;
  is_income: number;
  user_id: string;
}

export interface TransactionUpdateInput extends Partial<TransactionInput> {} 