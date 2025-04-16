'use strict';

import ProductModel from './models/product.js';
import { idSchema, productSchema } from './schemas/product.js';

export default [
  // GET all products
  {
    method: 'GET',
    path: '/api/products',
    handler: async (request, h) => {
      try {
        const products = await ProductModel.getAllProducts();
        return h.response(products).code(200);
      } catch (error) {
        console.error('Error fetching products:', error);
        return h.response({ message: 'Internal server error' }).code(500);
      }
    }
  },

  // GET a single product by ID
  {
    method: 'GET',
    path: '/api/products/{id}',
    options: {
      validate: {
        params: idSchema
      }
    },
    handler: async (request, h) => {
      try {
        const id = request.params.id;
        const product = await ProductModel.getProductById(id);

        if (!product) {
          return h.response({ message: 'Product not found' }).code(404);
        }

        return h.response(product).code(200);
      } catch (error) {
        console.error(`Error fetching product with ID ${request.params.id}:`, error);
        return h.response({ message: 'Internal server error' }).code(500);
      }
    }
  },

  // CREATE a new product
  {
    method: 'POST',
    path: '/api/products',
    options: {
      validate: {
        payload: productSchema
      }
    },
    handler: async (request, h) => {
      try {
        const product = request.payload;
        const result = await ProductModel.createProduct(product);

        return h.response({
          message: 'Product created successfully',
          id: result.id
        }).code(201);
      } catch (error) {
        console.error('Error creating product:', error);
        return h.response({ message: 'Internal server error' }).code(500);
      }
    }
  },

  // UPDATE an existing product
  {
    method: 'PUT',
    path: '/api/products/{id}',
    options: {
      validate: {
        params: idSchema,
        payload: productSchema
      }
    },
    handler: async (request, h) => {
      try {
        const id = request.params.id;
        const product = request.payload;

        // Check if product exists
        const existingProduct = await ProductModel.getProductById(id);
        if (!existingProduct) {
          return h.response({ message: 'Product not found' }).code(404);
        }

        const result = await ProductModel.updateProduct(id, product);

        return h.response({
          message: 'Product updated successfully',
          changes: result.changes
        }).code(200);
      } catch (error) {
        console.error(`Error updating product with ID ${request.params.id}:`, error);
        return h.response({ message: 'Internal server error' }).code(500);
      }
    }
  },

  // DELETE a product
  {
    method: 'DELETE',
    path: '/api/products/{id}',
    options: {
      validate: {
        params: idSchema
      }
    },
    handler: async (request, h) => {
      try {
        const id = request.params.id;

        // Check if product exists
        const existingProduct = await ProductModel.getProductById(id);
        if (!existingProduct) {
          return h.response({ message: 'Product not found' }).code(404);
        }

        await ProductModel.deleteProduct(id);

        return h.response({
          message: 'Product deleted successfully'
        }).code(200);
      } catch (error) {
        console.error(`Error deleting product with ID ${request.params.id}:`, error);
        return h.response({ message: 'Internal server error' }).code(500);
      }
    }
  },

  // Health check endpoint
  {
    method: 'GET',
    path: '/health',
    handler: (request, h) => {
      return h.response({ status: 'up', service: 'catalog' }).code(200);
    }
  }
];