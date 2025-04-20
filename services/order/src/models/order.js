'use strict';

import { v4 as uuidv4 } from 'uuid';
import { restoreProductStock, updateProductStock } from '../catalog-api.js';
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

      // Get current order to check previous status
      const currentOrder = await this.getOrderById(id);
      if (!currentOrder) {
        return null;
      }

      const previousStatus = currentOrder.status;

      await db.beginTransaction();

      const result = await db.run(
        `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, id]
      );

      if (result.changes === 0) {
        await db.rollback();
        return null;
      }

      // If order is being confirmed (moving to processing status), update product stock
      if (status === 'processing' && previousStatus === 'pending') {
        try {
          // Get order items to update stock
          const orderItems = await this.getOrderItems(id);

          // Call catalog service to update stock levels
          const stockUpdateResults = await updateProductStock(orderItems);

          console.log(`Stock update results for order ${id}:`, JSON.stringify(stockUpdateResults));

          // Here you could store the stock update results in a separate table if needed
        } catch (stockError) {
          console.error(`Error updating product stock for order ${id}:`, stockError);
          // Continue processing the order even if stock update fails
          // You could change this behavior to roll back if stock updates are critical
        }
      }

      // If order is being cancelled after processing/shipping/etc., restore product stock
      if (status === 'cancelled' &&
        (previousStatus === 'processing' || previousStatus === 'shipped' || previousStatus === 'delivered')) {
        try {
          // Get order items to restore stock
          const orderItems = await this.getOrderItems(id);

          // Call catalog service to restore stock levels
          const stockRestoreResults = await restoreProductStock(orderItems);

          console.log(`Stock restoration results for cancelled order ${id}:`, JSON.stringify(stockRestoreResults));

        } catch (stockError) {
          console.error(`Error restoring product stock for cancelled order ${id}:`, stockError);
          // Continue processing the status change even if stock restoration fails
          // This ensures order status changes aren't blocked by stock update issues
        }
      }

      await db.commit();
      return await this.getOrderById(id);
    } catch (error) {
      await db.rollback();
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