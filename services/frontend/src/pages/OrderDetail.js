import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { orderService } from '../services/order-service';

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(orderId);
        setOrder(data);
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch order ${orderId}:`, err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusUpdating(true);
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      setOrder(updatedOrder.order);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update order status:', err);
      toast.error('Failed to update order status. Please try again.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <Link to="/orders" className="text-blue-600 hover:text-blue-800">
          Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Order #{order.id.substring(0, 8)}...</h2>
              <p className="text-gray-500">Placed on {new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div className="flex items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold mb-2">Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td className="px-3 py-3">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                          <div className="text-xs text-gray-500">ID: {item.product_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500">${item.price.toFixed(2)}</td>
                    <td className="px-3 py-3 text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-3 py-3 text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
            <p className="text-gray-700 whitespace-pre-line">{order.shipping_address}</p>
          </div>

          <div>
            {order.payment_info && (
              <>
                <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
                <p className="text-gray-700 whitespace-pre-line">{order.payment_info}</p>
              </>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          <div className="flex space-x-2">
            {!statusUpdating && (
              <>
                <button
                  onClick={() => handleStatusUpdate('processing')}
                  disabled={order.status !== 'pending'}
                  className={`py-1 px-3 text-sm rounded ${order.status === 'pending' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  Process
                </button>
                <button
                  onClick={() => handleStatusUpdate('shipped')}
                  disabled={order.status !== 'processing'}
                  className={`py-1 px-3 text-sm rounded ${order.status === 'processing' ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  Ship
                </button>
                <button
                  onClick={() => handleStatusUpdate('delivered')}
                  disabled={order.status !== 'shipped'}
                  className={`py-1 px-3 text-sm rounded ${order.status === 'shipped' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  Deliver
                </button>
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={['delivered', 'cancelled'].includes(order.status)}
                  className={`py-1 px-3 text-sm rounded ${!['delivered', 'cancelled'].includes(order.status) ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  Cancel
                </button>
              </>
            )}
            {statusUpdating && (
              <span className="text-sm text-gray-500">Updating status...</span>
            )}
          </div>
          <div className="text-xl font-bold">
            Total: ${order.total_amount.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;