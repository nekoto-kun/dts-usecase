import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { cartService } from '../services/cart-service';
import { catalogService } from '../services/catalog-service';

const Home = ({ userId, cartId, setCartId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await catalogService.getAllProducts();
        setProducts(data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    try {
      let currentCartId = cartId;

      // If no cart exists, create a new one
      if (!currentCartId) {
        const cart = await cartService.createCart(userId);
        currentCartId = cart.id;
        setCartId(currentCartId);
      }

      // Add the product to the cart
      await cartService.addItemToCart(currentCartId, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        price: product.price,
        image_url: product.image_url
      });

      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error('Failed to add product to cart:', err);
      toast.error('Failed to add product to cart. Please try again.');
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
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">No image</div>
                )}
              </div>

              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description || 'No description available'}</p>
                <p className="text-lg font-bold text-blue-600 mb-3">Rp {product.price.toLocaleString('id-ID')}</p>
                <p className="text-sm text-gray-500 mb-4">In stock: {product.stock}</p>

                <div className="flex space-x-2">
                  <Link
                    to={`/products/${product.id}`}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock < 1}
                    className={`flex-1 py-2 px-4 rounded text-center ${product.stock > 0
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;