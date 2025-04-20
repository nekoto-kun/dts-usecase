// API endpoints for microservices
const API_ENDPOINTS = {
  // Catalog service endpoints
  CATALOG: {
    BASE_URL: (window.APP_CONFIG && window.APP_CONFIG.CATALOG_API) || process.env.REACT_APP_CATALOG_API || 'http://localhost:3000',
    PRODUCTS: '/api/products',
    PRODUCT_BY_ID: (id) => `/api/products/${id}`,
    HEALTH: '/health'
  },

  // Cart service endpoints
  CART: {
    BASE_URL: (window.APP_CONFIG && window.APP_CONFIG.CART_API) || process.env.REACT_APP_CART_API || 'http://localhost:5000',
    CARTS: '/api/carts',
    CART_BY_ID: (id) => `/api/carts/${id}`,
    CART_ITEMS: (cartId) => `/api/carts/${cartId}/items`,
    CART_ITEM: (cartId, itemId) => `/api/carts/${cartId}/items/${itemId}`,
    CART_PRODUCT: (cartId, productId) => `/api/carts/${cartId}/products/${productId}`,
    HEALTH: '/health'
  },

  // Order service endpoints
  ORDER: {
    BASE_URL: (window.APP_CONFIG && window.APP_CONFIG.ORDER_API) || process.env.REACT_APP_ORDER_API || 'http://localhost:8080',
    ORDERS: '/api/orders',
    ORDER_BY_ID: (id) => `/api/orders/${id}`,
    ORDER_STATUS: (id) => `/api/orders/${id}/status`,
    USER_ORDERS: (userId) => `/api/orders/user/${userId}`,
    HEALTH: '/health'
  }
};

export default API_ENDPOINTS;