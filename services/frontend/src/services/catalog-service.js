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
      // Remove id property when creating a new product
      const { id, ...productWithoutId } = product;
      const response = await catalogApi.post(API_ENDPOINTS.CATALOG.PRODUCTS, productWithoutId);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update an existing product
  updateProduct: async (productId, product) => {
    try {
      // Extract only the required properties for update
      const {
        name,
        description,
        price,
        stock,
        image_url
      } = product;

      const productToUpdate = {
        name,
        description: description || '',
        price: Number(price),
        stock: Number(stock),
        image_url: image_url || ''
      };

      const response = await catalogApi.put(
        API_ENDPOINTS.CATALOG.PRODUCT_BY_ID(productId),
        productToUpdate
      );
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