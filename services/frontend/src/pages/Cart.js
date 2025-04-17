import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { cartService } from '../services/cart-service';

const Cart = ({ userId, cartId }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      if (!cartId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await cartService.getCart(cartId);
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
  }, [cartId]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await cartService.updateCartItem(cartId, itemId, newQuantity);

      // Update cart in state
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ),
        total_price: prevCart.items.reduce((sum, item) => {
          const itemPrice = item.id === itemId
            ? item.price * newQuantity
            : item.price * item.quantity;
          return sum + itemPrice;
        }, 0)
      }));

      toast.success('Cart updated!');
    } catch (err) {
      console.error('Failed to update cart:', err);
      toast.error('Failed to update cart. Please try again.');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await cartService.removeCartItem(cartId, itemId);

      // Remove item from cart in state
      const updatedItems = cart.items.filter(item => item.id !== itemId);

      setCart(prevCart => ({
        ...prevCart,
        items: updatedItems,
        total_price: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }));

      toast.success('Item removed from cart!');
    } catch (err) {
      console.error('Failed to remove item from cart:', err);
      toast.error('Failed to remove item from cart. Please try again.');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart(cartId);

      setCart(prevCart => ({
        ...prevCart,
        items: [],
        total_price: 0
      }));

      toast.success('Cart cleared!');
    } catch (err) {
      console.error('Failed to clear cart:', err);
      toast.error('Failed to clear cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!cartId || (cart && cart.items.length === 0)) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600 mb-6">Your cart is empty.</p>
        <Link
          to="/"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded"
        >
          Browse Products
        </Link>
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
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cart.items.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.image_url && (
                        <div className="flex-shrink-0 h-10 w-10 mr-4">
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="h-10 w-10 object-cover rounded"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.product_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Product ID: {item.product_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rp {item.price.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded"
                      >
                        -
                      </button>
                      <span className="mx-2 text-gray-700 w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-6 py-4">
          <div className="text-right">
            <p className="text-xl font-semibold text-gray-900">
              Total: Rp {cart.total_price.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="mt-4 flex justify-between">
            <button
              onClick={handleClearCart}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            >
              Clear Cart
            </button>
            <Link
              to="/checkout"
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;