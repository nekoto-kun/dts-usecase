import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { cartService } from '../services/cart-service';
import { catalogService } from '../services/catalog-service';

const ProductDetail = ({ userId, cartId, setCartId }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await catalogService.getProductById(productId);
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch product ${productId}:`, err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 1)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!userId) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    try {
      setAddingToCart(true);

      // Create a new cart if needed
      let currentCartId = cartId;
      if (!currentCartId) {
        const newCart = await cartService.createCart(userId);
        currentCartId = newCart.id;
        setCartId(currentCartId);
      }

      // Add product to cart
      await cartService.addItemToCart(currentCartId, {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: quantity,
        image_url: product.image_url || null
      });

      toast.success(`${product.name} added to your cart!`);
    } catch (err) {
      console.error('Failed to add product to cart:', err);
      toast.error('Failed to add product to cart. Please try again.');
    } finally {
      setAddingToCart(false);
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

  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The requested product could not be found.</p>
        <Link
          to="/"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0 md:w-1/3">
            {product.image_url ? (
              <img
                className="w-full h-64 md:h-full object-cover"
                src={product.image_url}
                alt={product.name}
              />
            ) : (
              <div className="w-full h-64 md:h-full bg-gray-200 flex justify-center items-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>

          <div className="p-8 md:w-2/3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-xl text-blue-600 font-semibold mt-2">${product.price.toFixed(2)}</p>
              </div>

              <div className="bg-gray-100 py-1 px-3 rounded">
                <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {product.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                <p className="mt-2 text-gray-600 whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {product.stock > 0 && (
              <div className="mt-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className={`mt-6 w-full md:w-auto py-2 px-6 rounded-md text-white ${addingToCart
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;