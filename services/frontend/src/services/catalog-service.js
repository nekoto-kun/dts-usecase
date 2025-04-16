import axios from 'axios';
import API_ENDPOINTS from './api-config';

const catalogApi = axios.create({
  baseURL: API_ENDPOINTS.CATALOG.BASE_URL
});

export const catalogService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await catalogApi.get(API_ENDPOINTS.CATALOG.PRODUCTS);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get a single product by ID
  getProductById: async (productId) => {
    try {
      const response = await catalogApi.get(API_ENDPOINTS.CATALOG.PRODUCT_BY_ID(productId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      throw error;
    }
  },

  // Create a new product
  createProduct: async (product) => {
    try {
      const response = await catalogApi.post(API_ENDPOINTS.CATALOG.PRODUCTS, product);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update an existing product
  updateProduct: async (productId, product) => {
    try {
      const response = await catalogApi.put(API_ENDPOINTS.CATALOG.PRODUCT_BY_ID(productId), product);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (productId) => {
    try {
      const response = await catalogApi.delete(API_ENDPOINTS.CATALOG.PRODUCT_BY_ID(productId));
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${productId}:`, error);
      throw error;
    }
  },

  // Check service health
  checkHealth: async () => {
    try {
      const response = await catalogApi.get(API_ENDPOINTS.CATALOG.HEALTH);
      return response.data;
    } catch (error) {
      console.error('Error checking catalog service health:', error);
      throw error;
    }
  }
};