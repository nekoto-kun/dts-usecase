'use strict';

import OrderModel from './models/order.js';
import {
  idSchema,
  orderSchema,
  orderStatusSchema,
  paginationSchema,
  userIdSchema
} from './schemas/order.js';

export default [
  // GET all orders with pagination
  {
    method: 'GET',
    path: '/api/orders',
    options: {
      validate: {
        query: paginationSchema
      }
    },
    handler: async (request, h) => {
      try {
        const { page, limit } = request.query;
        const result = await OrderModel.getAllOrders(page, limit);
        return h.response(result).code(200);
      } catch (error) {
        console.error('Error fetching orders:', error);
        return h.response({ message: 'Internal server error' }).code(500);
      }
    }
  },

  // GET a single order by ID
  {
    method: 'GET',
    path: '/api/orders/{id}',
    options: {
      validate: {
        params: idSchema
      }
    },
    handler: async (request, h) => {
      try {
        const id = request.params.id;
        const order = await OrderModel.getOrderById(id);

        if (!order) {
          return h.response({ message: 'Order not found' }).code(404);
        }

        return h.response(order).code(200);
      } catch (error) {
        console.error(`Error fetching order with ID ${request.params.id}:`, error);
        return h.response({ message: 'Internal server error' }).code(500);
      }
    }
  },

  // GET orders by user ID
  {
    method: 'GET',
    path: '/api/orders/user/{userId}',
    options: {
      validate: {
        params: userIdSchema,
        query: paginationSchema
      }
    },
    handler: async (request, h) => {
      try {
        const userId = request.params.userId;
        const { page, limit } = request.query;
        const result = await OrderModel.getOrdersByUserId(userId, page, limit);

        return h.response(result).code(200);
      } catch (error) {
        console.error(`Error fetching orders for user ${request.params.userId}:`, error);
        return h.response({ message: 'Internal server error' }).code(500);
      }
    }
  },

  // CREATE a new order
  {
    method: 'POST',
    path: '/api/orders',
    options: {
      validate: {
        payload: orderSchema
      }
    },
    handler: async (request, h) => {
      try {
        const orderData = request.payload;
        const order = await OrderModel.createOrder(orderData);

        return h.response({
          message: 'Order created successfully',
          order
        }).code(201);
      } catch (error) {
        console.error('Error creating order:', error);
        return h.response({ message: 'Internal server error' }).code(500);
      }
    }
  },

  // UPDATE order status
  {
    method: 'PUT',
    path: '/api/orders/{id}/status',
    options: {
      validate: {
        params: idSchema,
        payload: orderStatusSchema
      }
    },
    handler: async (request, h) => {
      try {
        const id = request.params.id;
        const { status } = request.payload;

        const order = await OrderModel.updateOrderStatus(id, status);

        if (!order) {
          return h.response({ message: 'Order not found' }).code(404);
        }

        return h.response({
          message: 'Order status updated successfully',
          order
        }).code(200);
      } catch (error) {
        if (error.message && error.message.startsWith('Invalid status:')) {
          return h.response({ message: error.message }).code(400);
        }

        console.error(`Error updating status for order with ID ${request.params.id}:`, error);
        return h.response({ message: 'Internal server error' }).code(500);
      }
    }
  },

  // DELETE an order
  {
    method: 'DELETE',
    path: '/api/orders/{id}',
    options: {
      validate: {
        params: idSchema
      }
    },
    handler: async (request, h) => {
      try {
        const id = request.params.id;

        // First check if order exists
        const order = await OrderModel.getOrderById(id);
        if (!order) {
          return h.response({ message: 'Order not found' }).code(404);
        }

        const result = await OrderModel.deleteOrder(id);

        return h.response({
          message: 'Order deleted successfully'
        }).code(200);
      } catch (error) {
        console.error(`Error deleting order with ID ${request.params.id}:`, error);
        return h.response({ message: 'Internal server error' }).code(500);
      }
    }
  },

  // Health check endpoint
  {
    method: 'GET',
    path: '/health',
    handler: (request, h) => {
      return h.response({ status: 'up', service: 'order' }).code(200);
    }
  }
];