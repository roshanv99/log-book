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