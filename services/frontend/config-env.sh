#!/bin/sh

# Create runtime environment configuration
cat > /usr/share/caddy/env-config.js << EOF
window.APP_CONFIG = {
  CATALOG_API: "${REACT_APP_CATALOG_API:-http://localhost:3000}",
  CART_API: "${REACT_APP_CART_API:-http://localhost:5000}",
  ORDER_API: "${REACT_APP_ORDER_API:-http://localhost:8080}"
};
EOF

# Start Caddy server
exec caddy run --config /etc/caddy/Caddyfile