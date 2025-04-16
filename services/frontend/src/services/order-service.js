import axios from 'axios';
import API_ENDPOINTS from './api-config';

const orderApi = axios.create({
  baseURL: API_ENDPOINTS.ORDER.BASE_URL
});

export const orderService = {
  // Get all orders with pagination
  getAllOrders: async (page = 1, limit = 10) => {
    try {
      const response = await orderApi.get(
        `${API_ENDPOINTS.ORDER.ORDERS}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get a single order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await orderApi.get(API_ENDPOINTS.ORDER.ORDER_BY_ID(orderId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },

  // Get orders for specific user
  getUserOrders: async (userId, page = 1, limit = 10) => {
    try {
      const response = await orderApi.get(
        `${API_ENDPOINTS.ORDER.USER_ORDERS(userId)}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching orders for user ${userId}:`, error);
      throw error;
    }
  },

  // Create a new order
  createOrder: async (orderData) => {
    try {
      const response = await orderApi.post(API_ENDPOINTS.ORDER.ORDERS, orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update an order's status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await orderApi.put(
        API_ENDPOINTS.ORDER.ORDER_STATUS(orderId),
        { status }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating status for order ${orderId}:`, error);
      throw error;
    }
  },

  // Delete an order
  deleteOrder: async (orderId) => {
    try {
      const response = await orderApi.delete(API_ENDPOINTS.ORDER.ORDER_BY_ID(orderId));
      return response.data;
    } catch (error) {
      console.error(`Error deleting order ${orderId}:`, error);
      throw error;
    }
  },

  // Check service health
  checkHealth: async () => {
    try {
      const response = await orderApi.get(API_ENDPOINTS.ORDER.HEALTH);
      return response.data;
    } catch (error) {
      console.error('Error checking order service health:', error);
      throw error;
    }
  }
};