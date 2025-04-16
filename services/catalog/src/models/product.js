'use strict';

import * as db from '../database.js';

class ProductModel {
  // Get all products
  static async getAllProducts() {
    return await db.query('SELECT * FROM products ORDER BY id DESC');
  }

  // Get a single product by ID
  static async getProductById(id) {
    return await db.get('SELECT * FROM products WHERE id = ?', [id]);
  }

  // Create a new product
  static async createProduct(product) {
    const { name, description, price, stock, image_url } = product;
    return await db.run(
      'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, stock, image_url]
    );
  }

  // Update an existing product
  static async updateProduct(id, product) {
    const { name, description, price, stock, image_url } = product;
    return await db.run(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, price, stock, image_url, id]
    );
  }

  // Delete a product
  static async deleteProduct(id) {
    return await db.run('DELETE FROM products WHERE id = ?', [id]);
  }
}

export default ProductModel;