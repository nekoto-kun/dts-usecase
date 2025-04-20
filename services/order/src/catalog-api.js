'use strict';

import axios from 'axios';

// Use the environment variable from Kubernetes config
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:3000';

// Create axios instance for catalog service API calls
const catalogApi = axios.create({
  baseURL: CATALOG_SERVICE_URL,
  timeout: 5000
});

/**
 * Updates product stock after an order is confirmed
 * @param {Array} items - Order items containing product information
 * @returns {Promise<Array>} - Results of stock updates
 */
export const updateProductStock = async (items) => {
  try {
    const updatePromises = items.map(async (item) => {
      try {
        // Get current product details to check current stock
        const productResponse = await catalogApi.get(`/api/products/${item.product_id}`);
        const product = productResponse.data;

        if (!product) {
          throw new Error(`Product ${item.product_id} not found`);
        }

        // Calculate new stock level (ensure it doesn't go below zero)
        const newStock = Math.max(0, product.stock - item.quantity);

        // Create a properly formatted update payload that meets schema requirements
        const updatePayload = {
          name: product.name,
          description: product.description || '',
          price: product.price,
          stock: newStock,
          image_url: product.image_url || ''
        };

        // Update the product with new stock level
        await catalogApi.put(`/api/products/${item.product_id}`, updatePayload);

        console.log(`Updated stock for product ${item.product_id} (${item.product_name}) from ${product.stock} to ${newStock}`);

        return {
          product_id: item.product_id,
          product_name: item.product_name,
          previous_stock: product.stock,
          new_stock: newStock,
          success: true
        };
      } catch (error) {
        console.error(`Failed to update stock for product ${item.product_id}:`, error.message);
        if (error.response) {
          console.error(`Response status: ${error.response.status}, data:`, error.response.data);
        }
        return {
          product_id: item.product_id,
          product_name: item.product_name || 'Unknown product',
          success: false,
          error: error.message
        };
      }
    });

    return Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};

/**
 * Checks if all products in an order have sufficient stock
 * @param {Array} items - Order items containing product information
 * @returns {Promise<Object>} - Result of stock validation with success flag and any insufficient items
 */
export const validateProductStock = async (items) => {
  try {
    const validationResults = await Promise.all(items.map(async (item) => {
      try {
        // Get current product details to check stock
        const productResponse = await catalogApi.get(`/api/products/${item.product_id}`);
        const product = productResponse.data;

        if (!product) {
          return {
            product_id: item.product_id,
            product_name: item.product_name || 'Unknown product',
            requested: item.quantity,
            available: 0,
            valid: false,
            message: `Product ${item.product_id} not found`
          };
        }

        // Check if there's enough stock
        const isValid = product.stock >= item.quantity;

        return {
          product_id: item.product_id,
          product_name: product.name,
          requested: item.quantity,
          available: product.stock,
          valid: isValid,
          message: isValid ? 'OK' : `Insufficient stock (requested: ${item.quantity}, available: ${product.stock})`
        };
      } catch (error) {
        console.error(`Failed to validate stock for product ${item.product_id}:`, error.message);
        return {
          product_id: item.product_id,
          product_name: item.product_name || 'Unknown product',
          valid: false,
          message: `Error checking stock: ${error.message}`
        };
      }
    }));

    // Check if all items have sufficient stock
    const insufficientItems = validationResults.filter(item => !item.valid);
    const allValid = insufficientItems.length === 0;

    return {
      valid: allValid,
      message: allValid ? 'All products have sufficient stock' : 'Some products have insufficient stock',
      insufficientItems: insufficientItems
    };
  } catch (error) {
    console.error('Error validating product stock:', error);
    throw error;
  }
};

/**
 * Restores product stock when an order is cancelled
 * @param {Array} items - Order items containing product information
 * @returns {Promise<Array>} - Results of stock restoration
 */
export const restoreProductStock = async (items) => {
  try {
    const restorePromises = items.map(async (item) => {
      try {
        // Get current product details
        const productResponse = await catalogApi.get(`/api/products/${item.product_id}`);
        const product = productResponse.data;

        if (!product) {
          throw new Error(`Product ${item.product_id} not found`);
        }

        // Calculate new stock level by adding back the quantity
        const restoredStock = product.stock + item.quantity;

        // Create a properly formatted update payload
        const updatePayload = {
          name: product.name,
          description: product.description || '',
          price: product.price,
          stock: restoredStock,
          image_url: product.image_url || ''
        };

        // Update the product with restored stock level
        await catalogApi.put(`/api/products/${item.product_id}`, updatePayload);

        console.log(`Restored stock for product ${item.product_id} (${item.product_name}) from ${product.stock} to ${restoredStock}`);

        return {
          product_id: item.product_id,
          product_name: item.product_name,
          previous_stock: product.stock,
          new_stock: restoredStock,
          success: true
        };
      } catch (error) {
        console.error(`Failed to restore stock for product ${item.product_id}:`, error.message);
        if (error.response) {
          console.error(`Response status: ${error.response.status}, data:`, error.response.data);
        }
        return {
          product_id: item.product_id,
          product_name: item.product_name || 'Unknown product',
          success: false,
          error: error.message
        };
      }
    });

    return Promise.all(restorePromises);
  } catch (error) {
    console.error('Error restoring product stock:', error);
    throw error;
  }
};