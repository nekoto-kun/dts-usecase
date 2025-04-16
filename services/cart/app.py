from flask import Flask, jsonify
from flask_restful import Api
from dotenv import load_dotenv
import os
import logging
from db import init_db
from routes import register_routes

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    # Create Flask application
    app = Flask(__name__)
    
    # Configure database with absolute path
    base_dir = os.path.abspath(os.path.dirname(__file__))
    database_path = os.path.join(base_dir, 'data', 'cart.db')
    
    # Make sure the data directory exists
    os.makedirs(os.path.dirname(database_path), exist_ok=True)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{database_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    logger.info(f"Using database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    # Initialize database
    init_db(app)
    
    # Create API
    api = Api(app)
    
    # Register routes
    register_routes(api)
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'up', 'service': 'cart'})
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true')