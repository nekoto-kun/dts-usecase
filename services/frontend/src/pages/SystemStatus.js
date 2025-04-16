import React, { useEffect, useState } from 'react';
import { cartService } from '../services/cart-service';
import { catalogService } from '../services/catalog-service';
import { orderService } from '../services/order-service';

const SystemStatus = () => {
  const [statuses, setStatuses] = useState({
    catalog: { status: 'unknown', error: null },
    cart: { status: 'unknown', error: null },
    order: { status: 'unknown', error: null }
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    checkServicesHealth();
  }, []);

  const checkServicesHealth = async () => {
    setLoading(true);

    // Check Catalog service
    try {
      const catalogHealth = await catalogService.checkHealth();
      setStatuses(prev => ({
        ...prev,
        catalog: { status: 'up', data: catalogHealth, error: null }
      }));
    } catch (error) {
      console.error('Catalog service health check failed:', error);
      setStatuses(prev => ({
        ...prev,
        catalog: { status: 'down', error: error.message || 'Service unavailable' }
      }));
    }

    // Check Cart service
    try {
      const cartHealth = await cartService.checkHealth();
      setStatuses(prev => ({
        ...prev,
        cart: { status: 'up', data: cartHealth, error: null }
      }));
    } catch (error) {
      console.error('Cart service health check failed:', error);
      setStatuses(prev => ({
        ...prev,
        cart: { status: 'down', error: error.message || 'Service unavailable' }
      }));
    }

    // Check Order service
    try {
      const orderHealth = await orderService.checkHealth();
      setStatuses(prev => ({
        ...prev,
        order: { status: 'up', data: orderHealth, error: null }
      }));
    } catch (error) {
      console.error('Order service health check failed:', error);
      setStatuses(prev => ({
        ...prev,
        order: { status: 'down', error: error.message || 'Service unavailable' }
      }));
    }

    setLoading(false);
    setLastUpdated(new Date());
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Status</h1>
        <button
          onClick={checkServicesHealth}
          disabled={loading}
          className={`py-2 px-4 rounded ${loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
        >
          {loading ? 'Checking...' : 'Refresh Status'}
        </button>
      </div>

      {lastUpdated && (
        <p className="text-gray-500 mb-6">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Catalog Service Status */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className={`px-6 py-4 ${statuses.catalog.status === 'up' ? 'bg-green-500' :
              statuses.catalog.status === 'down' ? 'bg-red-500' : 'bg-gray-500'
            } text-white`}>
            <h2 className="text-xl font-semibold">Catalog Service</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-3 h-3 rounded-full mr-2 ${statuses.catalog.status === 'up' ? 'bg-green-500' :
                  statuses.catalog.status === 'down' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
              <span className="font-medium">Status: {statuses.catalog.status.toUpperCase()}</span>
            </div>

            {statuses.catalog.status === 'up' && statuses.catalog.data && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Service: {statuses.catalog.data.service}</p>
              </div>
            )}

            {statuses.catalog.status === 'down' && (
              <div className="mt-2 text-sm text-red-600">
                <p>Error: {statuses.catalog.error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart Service Status */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className={`px-6 py-4 ${statuses.cart.status === 'up' ? 'bg-green-500' :
              statuses.cart.status === 'down' ? 'bg-red-500' : 'bg-gray-500'
            } text-white`}>
            <h2 className="text-xl font-semibold">Cart Service</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-3 h-3 rounded-full mr-2 ${statuses.cart.status === 'up' ? 'bg-green-500' :
                  statuses.cart.status === 'down' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
              <span className="font-medium">Status: {statuses.cart.status.toUpperCase()}</span>
            </div>

            {statuses.cart.status === 'up' && statuses.cart.data && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Service: {statuses.cart.data.service}</p>
              </div>
            )}

            {statuses.cart.status === 'down' && (
              <div className="mt-2 text-sm text-red-600">
                <p>Error: {statuses.cart.error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Service Status */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className={`px-6 py-4 ${statuses.order.status === 'up' ? 'bg-green-500' :
              statuses.order.status === 'down' ? 'bg-red-500' : 'bg-gray-500'
            } text-white`}>
            <h2 className="text-xl font-semibold">Order Service</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-3 h-3 rounded-full mr-2 ${statuses.order.status === 'up' ? 'bg-green-500' :
                  statuses.order.status === 'down' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
              <span className="font-medium">Status: {statuses.order.status.toUpperCase()}</span>
            </div>

            {statuses.order.status === 'up' && statuses.order.data && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Service: {statuses.order.data.service}</p>
              </div>
            )}

            {statuses.order.status === 'down' && (
              <div className="mt-2 text-sm text-red-600">
                <p>Error: {statuses.order.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">System Information</h2>
        <div className="space-y-2">
          <p><strong>Frontend Version:</strong> 1.0.0</p>
          <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
          <p className="text-sm text-gray-500 mt-4">
            This dashboard shows the current status of all microservices in the system. If any service shows as DOWN,
            please check the corresponding service logs and ensure the service is running properly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;