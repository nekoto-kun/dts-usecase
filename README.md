# E-Commerce Microservices Demo

A demonstration of a microservices architecture for an e-commerce application, designed for deployment to a Kubernetes cluster.

## Architecture Overview

This project consists of four main components:

1. **Catalog Service** (JavaScript/Hapi.js) - Manages product inventory
2. **Cart Service** (Python/Flask) - Handles shopping cart functionality
3. **Order Service** (JavaScript/Hapi.js) - Processes and manages orders
4. **Frontend** (React/Tailwind CSS) - User interface for interacting with all services

## Tech Stack

- **Catalog Service**: JavaScript, Hapi.js, SQLite
- **Cart Service**: Python, Flask, SQLite
- **Order Service**: JavaScript, Hapi.js, SQLite
- **Frontend**: React, Tailwind CSS, Axios, React Router

## Running the Services Locally

### Prerequisites

- Node.js 18.x or later
- Python 3.9 or later
- npm/pip package managers

### Order Service (JavaScript/Hapi.js)

```bash
cd services/order
npm install
node src/server.js
```

The Order service will be available at http://localhost:8080

### Catalog Service (JavaScript)

```bash
cd services/catalog
npm install
node src/server.js
```

The Catalog service will be available at http://localhost:3000

### Cart Service (Python)

```bash
cd services/cart
pip install -r requirements.txt
python app.py
```

The Cart service will be available at http://localhost:5000

### Frontend (React)

```bash
cd services/frontend
npm install
npm start
```

The frontend will be available at http://localhost:3000 (use a different port if the catalog service is already running)

## API Endpoints

### Catalog Service

- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/{id}` - Update a product
- `DELETE /api/products/{id}` - Delete a product
- `GET /health` - Health check endpoint

### Cart Service

- `POST /api/carts` - Create a new cart
- `GET /api/carts/{id}` - Get cart by ID
- `DELETE /api/carts/{id}` - Delete a cart
- `POST /api/carts/{id}/items` - Add item to cart
- `PUT /api/carts/{id}/items/{item_id}` - Update cart item
- `DELETE /api/carts/{id}/items/{item_id}` - Remove item from cart
- `DELETE /api/carts/{id}/items` - Clear cart
- `GET /health` - Health check endpoint

### Order Service

- `GET /api/orders` - List all orders
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/user/{userId}` - Get user orders
- `POST /api/orders` - Create a new order
- `PUT /api/orders/{id}/status` - Update order status
- `DELETE /api/orders/{id}` - Delete an order
- `GET /health` - Health check endpoint

## Docker Containers

Each service includes a Dockerfile for containerization. Build the containers with:

```bash
# Build Catalog Service
docker build -t catalog-service ./services/catalog

# Build Cart Service
docker build -t cart-service ./services/cart

# Build Order Service
docker build -t order-service ./services/order

# Build Frontend
docker build -t frontend ./services/frontend
```

## Azure Kubernetes Service (AKS) Deployment

To deploy this application to Azure Kubernetes Service (AKS), follow these steps:

### Prerequisites

- Azure CLI installed and configured
- PowerShell
- kubectl command-line tool
- Docker installed and running

### Deployment Steps

1. **Build and Push Container Images to Azure Container Registry**

   Run the build and push script:
   ```powershell
   .\build-and-push-images.ps1
   ```
   
   This script will:
   - Prompt for your ACR name, resource group, and image tag version
   - Verify your Azure login status
   - Build all service images
   - Push the images to your Azure Container Registry

2. **Create an AKS Cluster**

   Run the cluster creation script:
   ```powershell
   .\create-aks-cluster.ps1
   ```
   
   This script will create a new AKS cluster in your specified resource group and configure it for your application.

3. **Deploy Services to AKS**

   Apply all Kubernetes manifests:
   ```powershell
   kubectl apply -f .\k8s
   ```
   
   This will deploy all microservices to your AKS cluster with proper configurations.

4. **Access the Application**

   After deployment completes, you can find the public IP addresses for your services:
   ```powershell
   kubectl get svc -n e-shop
   ```

5. **Clean Up Resources**

   When you're done with the demo, you can clean up the resources:
   
   Delete the AKS cluster:
   ```powershell
   .\delete-aks-cluster.ps1
   ```
   
   Delete the Azure Container Registry:
   ```powershell
   .\delete-acr.ps1
   ```
   
   The scripts will prompt for confirmation and display resource details before deletion.

## Future Enhancements

1. Add authentication/authorization
2. Implement proper database backends
3. Add message queues for asynchronous communication
4. Implement distributed logging and monitoring

## License

See LICENSE file for details.
