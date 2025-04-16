from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Initialize SQLAlchemy without binding to app
convention = {
    "ix": 'ix_%(column_0_label)s',
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

metadata = MetaData(naming_convention=convention)
db = SQLAlchemy(metadata=metadata)

def init_db(app):
    # Ensure data directory exists with absolute path
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)
        logger.info(f"Created data directory at {data_dir}")
    
    # Initialize SQLAlchemy with app
    db.init_app(app)
    
    with app.app_context():
        # Import models to register them with SQLAlchemy
        from models import Cart, CartItem
        
        # Create tables
        db.create_all()
        logger.info("Database tables created")
        
    return db