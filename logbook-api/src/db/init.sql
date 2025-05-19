-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create currencies table
CREATE TABLE IF NOT EXISTS currencies (
    currency_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency_name VARCHAR(50) NOT NULL,
    currency_symbol VARCHAR(5) NOT NULL,
    currency_code VARCHAR(3) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sub_categories table
CREATE TABLE IF NOT EXISTS sub_categories (
    sub_category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sub_category_name VARCHAR(50) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sub_category_name, category_id)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mobile_number VARCHAR(20),
    profile_pic TEXT,
    currency_id UUID REFERENCES currencies(currency_id),
    monthly_start_date INTEGER CHECK (monthly_start_date BETWEEN 1 AND 31),
    password_hash TEXT NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_date DATE NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(category_id),
    sub_category_id UUID NOT NULL REFERENCES sub_categories(sub_category_id),
    transaction_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency_id UUID NOT NULL REFERENCES currencies(currency_id),
    seller_name VARCHAR(100),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    discount_origin VARCHAR(50),
    comments TEXT,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    transaction_type BOOLEAN NOT NULL CHECK (transaction_type IN (true, false)), -- false for debit, true for credit
    is_income BOOLEAN NOT NULL CHECK (is_income IN (true, false)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
    investment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investment_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency_id UUID NOT NULL REFERENCES currencies(currency_id),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_sub_category ON transactions(sub_category_id);
CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_date ON investments(investment_date);
CREATE INDEX IF NOT EXISTS idx_sub_categories_category ON sub_categories(category_id);

-- Insert default currencies
INSERT INTO currencies (currency_name, currency_symbol, currency_code) VALUES
    ('US Dollar', '$', 'USD'),
    ('Euro', '€', 'EUR'),
    ('British Pound', '£', 'GBP'),
    ('Indian Rupee', '₹', 'INR'),
    ('Japanese Yen', '¥', 'JPY')
ON CONFLICT (currency_code) DO NOTHING;

-- Insert default categories
INSERT INTO categories (category_name) VALUES
    ('Food & Dining'),
    ('Shopping'),
    ('Transportation'),
    ('Housing'),
    ('Entertainment'),
    ('Healthcare'),
    ('Education'),
    ('Personal Care'),
    ('Income'),
    ('Investments'),
    ('Utilities'),
    ('Travel')
ON CONFLICT (category_name) DO NOTHING;

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at
    BEFORE UPDATE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 