import axios from 'axios';
import API_ENDPOINTS from './api-config';

const cartApi = axios.create({
  baseURL: API_ENDPOINTS.CART.BASE_URL
});

export const cartService = {
  // Create a new cart
  createCart: async (userId = null) => {
    try {
      const payload = userId ? { user_id: userId } : {};
      const response = await cartApi.post(API_ENDPOINTS.CART.CARTS, payload);
      return response.data;
    } catch (error) {
      console.error('Error creating cart:', error);
      throw error;
    }
  },

  // Get cart by ID
  getCart: async (cartId) => {
    try {
      const response = await cartApi.get(API_ENDPOINTS.CART.CART_BY_ID(cartId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching cart ${cartId}:`, error);
      throw error;
    }
  },

  // Delete a cart
  deleteCart: async (cartId) => {
    try {
      const response = await cartApi.delete(API_ENDPOINTS.CART.CART_BY_ID(cartId));
      return response.data;
    } catch (error) {
      console.error(`Error deleting cart ${cartId}:`, error);
      throw error;
    }
  },

  // Add item to cart
  addItemToCart: async (cartId, item) => {
    try {
      const response = await cartApi.post(API_ENDPOINTS.CART.CART_ITEMS(cartId), item);
      return response.data;
    } catch (error) {
      console.error(`Error adding item to cart ${cartId}:`, error);
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (cartId, itemId, quantity) => {
    try {
      const response = await cartApi.put(
        API_ENDPOINTS.CART.CART_ITEM(cartId, itemId),
        { quantity }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating item in cart ${cartId}:`, error);
      throw error;
    }
  },

  // Remove item from cart
  removeCartItem: async (cartId, itemId) => {
    try {
      const response = await cartApi.delete(API_ENDPOINTS.CART.CART_ITEM(cartId, itemId));
      return response.data;
    } catch (error) {
      console.error(`Error removing item from cart ${cartId}:`, error);
      throw error;
    }
  },

  // Remove product from cart by product ID
  removeProductFromCart: async (cartId, productId) => {
    try {
      const response = await cartApi.delete(API_ENDPOINTS.CART.CART_PRODUCT(cartId, productId));
      return response.data;
    } catch (error) {
      console.error(`Error removing product ${productId} from cart ${cartId}:`, error);
      throw error;
    }
  },

  // Clear all items from cart
  clearCart: async (cartId) => {
    try {
      const response = await cartApi.delete(API_ENDPOINTS.CART.CART_ITEMS(cartId));
      return response.data;
    } catch (error) {
      console.error(`Error clearing cart ${cartId}:`, error);
      throw error;
    }
  },

  // Check service health
  checkHealth: async () => {
    try {
      const response = await cartApi.get(API_ENDPOINTS.CART.HEALTH);
      return response.data;
    } catch (error) {
      console.error('Error checking cart service health:', error);
      throw error;
    }
  }
};