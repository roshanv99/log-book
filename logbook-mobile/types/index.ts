export interface Transaction {
  transaction_id: number;
  transaction_date: string;
  category_id: number;
  sub_category_id: number;
  transaction_name: string;
  amount: number;
  currency_id: number;
  seller_name: string;
  discount_amount: number;
  discount_origin: string;
  comments: string;
  user_id: string;
  transaction_type: number;
  is_income: number;
  created_at: string;
  updated_at: string;
}

export interface Investment {
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

export interface Category {
  category_id: number;
  category_name: string;
}

export interface SubCategory {
  sub_category_id: number;
  sub_category_name: string;
  category_id: number;
}

export interface Currency {
  currency_id: number;
  currency_name: string;
  currency_symbol: string;
  currency_code: string;
}

export interface TransactionFormData {
  transaction_date: string;
  category_id: number;
  sub_category_id: number;
  transaction_name: string;
  amount: number;
  currency_id: number;
  seller_name: string;
  discount_amount: number;
  discount_origin: string;
  comments: string;
  transaction_type: number;
  is_income: number;
  user_id: string;
}

export interface InvestmentFormData {
  investment_date: string;
  type: string;
  name: string;
  amount: number;
  currency_id: number;
  user_id: string;
}

export interface User {
  user_id: string | number;
  username: string;
  email: string;
  currency_id?: number;
  // Add other fields as needed
} 