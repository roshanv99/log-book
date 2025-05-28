import pool from '../config/db';
import { Category, SubCategory } from '../models/Category';

class CategoryService {
  // ... existing methods ...

  async ensureUnknownCategory(): Promise<Category> {
    // Check if Unknown category exists
    const result = await pool.query(
      'SELECT * FROM categories WHERE LOWER(category_name) = LOWER($1)',
      ['Unknown']
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Create Unknown category if it doesn't exist
    const insertResult = await pool.query(
      'INSERT INTO categories (category_name) VALUES ($1) RETURNING *',
      ['Unknown']
    );
    return insertResult.rows[0];
  }

  async addCategory(categoryName: string): Promise<Category> {
    // Check if category already exists
    const existingCategory = await pool.query(
      'SELECT * FROM categories WHERE LOWER(category_name) = LOWER($1)',
      [categoryName]
    );

    if (existingCategory.rows.length > 0) {
      return existingCategory.rows[0];
    }

    // Create new category
    const result = await pool.query(
      'INSERT INTO categories (category_name) VALUES ($1) RETURNING *',
      [categoryName]
    );
    return result.rows[0];
  }

  async addSubCategory(categoryId: number, subCategoryName: string): Promise<SubCategory> {
    // Check if category exists
    const category = await pool.query(
      'SELECT * FROM categories WHERE category_id = $1',
      [categoryId]
    );

    if (category.rows.length === 0) {
      throw new Error('Category not found');
    }

    // Check if subcategory already exists under this category
    const existingSubCategory = await pool.query(
      'SELECT * FROM sub_categories WHERE category_id = $1 AND LOWER(sub_category_name) = LOWER($2)',
      [categoryId, subCategoryName]
    );

    if (existingSubCategory.rows.length > 0) {
      return existingSubCategory.rows[0];
    }

    // Create new subcategory
    const result = await pool.query(
      'INSERT INTO sub_categories (category_id, sub_category_name) VALUES ($1, $2) RETURNING *',
      [categoryId, subCategoryName]
    );
    return result.rows[0];
  }

  async deleteCategory(categoryId: number): Promise<void> {
    // Get the Unknown category
    const unknownCategory = await this.ensureUnknownCategory();

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // First, get all subcategories of this category
      const subCategoriesResult = await client.query(
        'SELECT sub_category_id FROM sub_categories WHERE category_id = $1',
        [categoryId]
      );
      const subCategoryIds = subCategoriesResult.rows.map(row => row.sub_category_id);

      // Update all transactions in this category to use Unknown category
      await client.query(
        `UPDATE transactions 
         SET category_id = $1, 
             sub_category_id = NULL,
             updated_at = NOW() 
         WHERE category_id = $2`,
        [unknownCategory.category_id, categoryId]
      );

      // Delete all subcategories of this category
      if (subCategoryIds.length > 0) {
        await client.query(
          'DELETE FROM sub_categories WHERE category_id = $1',
          [categoryId]
        );
      }

      // Finally, delete the category
      await client.query(
        'DELETE FROM categories WHERE category_id = $1',
        [categoryId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteSubCategory(subCategoryId: number): Promise<void> {
    console.log('Deleting subcategory:', subCategoryId);
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // First check if there are any transactions using this subcategory
      const transactionsResult = await client.query(
        'SELECT COUNT(*) FROM transactions WHERE sub_category_id = $1',
        [subCategoryId]
      );

      const transactionCount = parseInt(transactionsResult.rows[0].count);
      
      if (transactionCount > 0) {
        // If there are transactions, update them to have null subcategory
        await client.query(
          `UPDATE transactions 
           SET sub_category_id = NULL, 
               updated_at = NOW() 
           WHERE sub_category_id = $1`,
          [subCategoryId]
        );
      }

      // Delete the subcategory
      const deleteResult = await client.query(
        'DELETE FROM sub_categories WHERE sub_category_id = $1 RETURNING *',
        [subCategoryId]
      );

      if (deleteResult.rows.length === 0) {
        throw new Error('Subcategory not found');
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getCategories(): Promise<Category[]> {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY category_name'
    );
    return result.rows;
  }

  async getSubCategories(categoryId?: number): Promise<SubCategory[]> {
    if (categoryId) {
      const result = await pool.query(
        'SELECT * FROM sub_categories WHERE category_id = $1 ORDER BY sub_category_name',
        [categoryId]
      );
      return result.rows;
    } else {
      const result = await pool.query(
        'SELECT * FROM sub_categories ORDER BY sub_category_name'
      );
      return result.rows;
    }
  }

  // ... existing methods ...
}

export default new CategoryService(); 