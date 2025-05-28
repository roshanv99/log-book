-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create sub_categories table
CREATE TABLE IF NOT EXISTS sub_categories (
    sub_category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sub_category_name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    UNIQUE(sub_category_name, category_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sub_categories_category ON sub_categories(category_id);

-- Insert default categories
INSERT OR IGNORE INTO categories (category_name) VALUES
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
    ('Travel');

-- Create People table
CREATE TABLE people (
    person_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    user_id INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Transaction_People table
CREATE TABLE transaction_people (
    transaction_people_id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(transaction_id),
    person_id INTEGER REFERENCES people(person_id),
    split_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_paid SMALLINT DEFAULT 0 CHECK (is_paid IN (-1, 0, 1)),
    item_content JSONB DEFAULT '[]'::jsonb
);

-- Add indexes for better query performance
CREATE INDEX idx_transaction_people_transaction_id ON transaction_people(transaction_id);
CREATE INDEX idx_transaction_people_person_id ON transaction_people(person_id);
CREATE INDEX idx_transaction_people_is_paid ON transaction_people(is_paid);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_people_updated_at
    BEFORE UPDATE ON people
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transaction_people_updated_at
    BEFORE UPDATE ON transaction_people
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 