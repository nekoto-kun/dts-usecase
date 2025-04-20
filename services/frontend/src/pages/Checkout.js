import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { cartService } from '../services/cart-service';
import { orderService } from '../services/order-service';

const Checkout = ({ userId, cartId, setCartId }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentInfo, setPaymentInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockErrors, setStockErrors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      if (!cartId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const data = await cartService.getCart(cartId);

        if (!data || data.items.length === 0) {
          toast.error('Your cart is empty. Add some products first.');
          navigate('/');
          return;
        }

        setCart(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch cart:', err);
        setError('Failed to load cart. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [cartId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!shippingAddress) {
      toast.error('Please enter a shipping address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setStockErrors([]);

      // Create order items from cart items
      const items = cart.items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price
      }));

      // Create order
      const orderData = {
        user_id: userId,
        items: items,
        shipping_address: shippingAddress,
        payment_info: paymentInfo || null
      };

      try {
        const response = await orderService.createOrder(orderData);

        // Clear cart after successful order
        await cartService.clearCart(cartId);

        // Reset cart ID to create a new one when adding more products
        setCartId(null);
        localStorage.removeItem('cartId');

        toast.success('Order placed successfully!');
        navigate(`/orders/${response.order.id}`);
      } catch (err) {
        // Handle 400 Bad Request which might indicate stock issues
        if (err.response && err.response.status === 400 && err.response.data.insufficientItems) {
          setStockErrors(err.response.data.insufficientItems);
          toast.error('Some products have insufficient stock. Please review your order.');
          // Scroll to the top to show errors
          window.scrollTo(0, 0);
        } else {
          // Handle other errors
          console.error('Failed to place order:', err);
          toast.error('Failed to place order. Please try again later.');
        }
      }
    } finally {
      setIsSubmitting(false);
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
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Stock error display */}
      {stockErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
          <h3 className="text-lg font-bold mb-2">Insufficient Stock</h3>
          <p className="mb-2">The following items in your cart have insufficient stock:</p>
          <ul className="list-disc pl-5 space-y-1">
            {stockErrors.map((item, index) => (
              <li key={index}>
                <span className="font-medium">{item.product_name}</span>: You ordered {item.requested},
                but only {item.available} {item.available === 1 ? 'item' : 'items'} available
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Please adjust the quantities in your cart before placing the order.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {cart && cart.items.map(item => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-gray-600 text-sm">Rp {item.price.toLocaleString('id-ID')} x {item.quantity}</p>
                </div>
                <p className="font-semibold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
              </div>
            ))}

            <div className="mt-4 pt-2 border-t">
              <div className="flex justify-between items-center">
                <p className="font-semibold">Total:</p>
                <p className="font-bold text-xl text-blue-600">Rp {cart?.total_price.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>

            <div className="mb-4">
              <label htmlFor="shipping-address" className="block text-gray-700 font-medium mb-2">
                Shipping Address *
              </label>
              <textarea
                id="shipping-address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter your shipping address"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="payment-info" className="block text-gray-700 font-medium mb-2">
                Payment Information
              </label>
              <textarea
                id="payment-info"
                value={paymentInfo}
                onChange={(e) => setPaymentInfo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Enter your payment information (optional)"
              />
              <p className="text-gray-500 text-sm mt-1">
                This is a demo app, do not enter real payment information.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 rounded text-white ${isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
                }`}
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;