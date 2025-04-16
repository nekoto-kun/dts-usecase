'use strict';

import { v4 as uuidv4 } from 'uuid';
import * as db from '../database.js';

class OrderModel {
  // Get all orders with pagination
  static async getAllOrders(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    try {
      // Get total count of orders
      const countResult = await db.get('SELECT COUNT(*) as total FROM orders');
      const total = countResult.total;

      // Get paginated orders
      const orders = await db.query(
        'SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );

      // For each order, get its items
      for (const order of orders) {
        order.items = await this.getOrderItems(order.id);

        // Format dates
        order.created_at = new Date(order.created_at).toISOString();
        order.updated_at = new Date(order.updated_at).toISOString();
      }

      return {
        data: orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      throw error;
    }
  }

  // Get a single order by ID
  static async getOrderById(id) {
    try {
      const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);

      if (!order) {
        return null;
      }

      // Get order items
      order.items = await this.getOrderItems(id);

      // Format dates
      order.created_at = new Date(order.created_at).toISOString();
      order.updated_at = new Date(order.updated_at).toISOString();

      return order;
    } catch (error) {
      console.error(`Error in getOrderById for ID ${id}:`, error);
      throw error;
    }
  }

  // Get orders by user ID
  static async getOrdersByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    try {
      // Get total count of user's orders
      const countResult = await db.get(
        'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
        [userId]
      );
      const total = countResult.total;

      // Get paginated user orders
      const orders = await db.query(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );

      // For each order, get its items
      for (const order of orders) {
        order.items = await this.getOrderItems(order.id);

        // Format dates
        order.created_at = new Date(order.created_at).toISOString();
        order.updated_at = new Date(order.updated_at).toISOString();
      }

      return {
        data: orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error(`Error in getOrdersByUserId for user ${userId}:`, error);
      throw error;
    }
  }

  // Helper method to get items for an order
  static async getOrderItems(orderId) {
    try {
      return await db.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orderId]
      );
    } catch (error) {
      console.error(`Error getting items for order ${orderId}:`, error);
      throw error;
    }
  }

  // Create a new order
  static async createOrder(orderData) {
    try {
      const { user_id, items, shipping_address, payment_info } = orderData;

      // Calculate total amount
      let total_amount = 0;
      for (const item of items) {
        total_amount += item.price * item.quantity;
      }

      // Generate UUID for order
      const orderId = uuidv4();

      await db.beginTransaction();

      // Create the order
      await db.run(
        `INSERT INTO orders (id, user_id, status, total_amount, shipping_address, payment_info)
         VALUES (?, ?, 'pending', ?, ?, ?)`,
        [orderId, user_id, total_amount, shipping_address, payment_info || null]
      );

      // Add order items
      for (const item of items) {
        await db.run(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.product_name, item.quantity, item.price]
        );
      }

      await db.commit();

      // Return the newly created order
      return await this.getOrderById(orderId);
    } catch (error) {
      await db.rollback();
      console.error('Error in createOrder:', error);
      throw error;
    }
  }

  // Update an order's status
  static async updateOrderStatus(id, status) {
    try {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const result = await db.run(
        `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, id]
      );

      if (result.changes === 0) {
        return null;
      }

      return await this.getOrderById(id);
    } catch (error) {
      console.error(`Error in updateOrderStatus for ID ${id}:`, error);
      throw error;
    }
  }

  // Delete an order
  static async deleteOrder(id) {
    try {
      await db.beginTransaction();

      // Delete order items first (if foreign keys weren't enforced)
      await db.run('DELETE FROM order_items WHERE order_id = ?', [id]);

      // Delete the order
      const result = await db.run('DELETE FROM orders WHERE id = ?', [id]);

      await db.commit();

      return result.changes > 0;
    } catch (error) {
      await db.rollback();
      console.error(`Error in deleteOrder for ID ${id}:`, error);
      throw error;
    }
  }
}

export default OrderModel;