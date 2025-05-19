-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Users Table
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mobile_number VARCHAR(20),
    profile_pic TEXT,
    currency_id INTEGER,
    monthly_start_date INTEGER CHECK (monthly_start_date BETWEEN 1 AND 31),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password_hash TEXT NOT NULL,
    last_login TIMESTAMP,
    FOREIGN KEY (currency_id) REFERENCES currencies(currency_id)
);

-- Currencies Table
CREATE TABLE currencies (
    currency_id INTEGER PRIMARY KEY AUTOINCREMENT,
    currency_name VARCHAR(50) NOT NULL,
    currency_symbol VARCHAR(5) NOT NULL,
    currency_code VARCHAR(3) NOT NULL UNIQUE
);

-- Categories Table
CREATE TABLE categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name VARCHAR(50) NOT NULL UNIQUE
);

-- Sub-Categories Table
CREATE TABLE sub_categories (
    sub_category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sub_category_name VARCHAR(50) NOT NULL,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    UNIQUE(sub_category_name, category_id)
);

-- Transactions Table
CREATE TABLE transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_date DATE NOT NULL,
    category_id INTEGER NOT NULL,
    sub_category_id INTEGER NOT NULL,
    transaction_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency_id INTEGER NOT NULL,
    seller_name VARCHAR(100),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    discount_origin VARCHAR(50),
    comments TEXT,
    user_id INTEGER NOT NULL,
    transaction_type BOOLEAN NOT NULL CHECK (transaction_type IN (0,1)), -- 0 for debit, 1 for credit
    is_income BOOLEAN NOT NULL CHECK (is_income IN (0,1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (sub_category_id) REFERENCES sub_categories(sub_category_id),
    FOREIGN KEY (currency_id) REFERENCES currencies(currency_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Investments Table
CREATE TABLE investments (
    investment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    investment_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (currency_id) REFERENCES currencies(currency_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_sub_category ON transactions(sub_category_id);
CREATE INDEX idx_investments_user ON investments(user_id);
CREATE INDEX idx_investments_date ON investments(investment_date);
CREATE INDEX idx_sub_categories_category ON sub_categories(category_id);

-- Insert default currencies
INSERT INTO currencies (currency_name, currency_symbol, currency_code) VALUES
    ('US Dollar', '$', 'USD'),
    ('Euro', '€', 'EUR'),
    ('British Pound', '£', 'GBP'),
    ('Indian Rupee', '₹', 'INR'),
    ('Japanese Yen', '¥', 'JPY');

-- Insert default categories
INSERT INTO categories (category_name) VALUES
    ('Food'),
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
    ('Travel');

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
END;

CREATE TRIGGER update_transactions_timestamp 
AFTER UPDATE ON transactions
BEGIN
    UPDATE transactions SET updated_at = CURRENT_TIMESTAMP WHERE transaction_id = NEW.transaction_id;
END;

CREATE TRIGGER update_investments_timestamp 
AFTER UPDATE ON investments
BEGIN
    UPDATE investments SET updated_at = CURRENT_TIMESTAMP WHERE investment_id = NEW.investment_id;
END; 