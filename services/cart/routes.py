from flask import request, jsonify
from flask_restful import Resource
from marshmallow import ValidationError
from db import db
from models import Cart, CartItem
from schema import CartItemSchema, CartItemUpdateSchema, CartSchema
import logging

logger = logging.getLogger(__name__)

class CartResource(Resource):
    def get(self, cart_id):
        """Get a cart by ID"""
        cart = Cart.query.get(cart_id)
        
        if not cart:
            return {"message": "Cart not found"}, 404
            
        return cart.to_dict(), 200
        
    def delete(self, cart_id):
        """Delete a cart by ID"""
        cart = Cart.query.get(cart_id)
        
        if not cart:
            return {"message": "Cart not found"}, 404
            
        db.session.delete(cart)
        db.session.commit()
        
        return {"message": "Cart deleted successfully"}, 200


class CartsResource(Resource):
    def post(self):
        """Create a new cart"""
        try:
            schema = CartSchema()
            data = schema.load(request.get_json() or {})
            
            cart = Cart(user_id=data.get('user_id'))
            db.session.add(cart)
            db.session.commit()
            
            return cart.to_dict(), 201
            
        except ValidationError as e:
            return {"message": "Invalid input", "errors": e.messages}, 400
        except Exception as e:
            logger.error(f"Error creating cart: {str(e)}")
            return {"message": "An error occurred while creating the cart"}, 500


class CartItemsResource(Resource):
    def post(self, cart_id):
        """Add an item to a cart"""
        cart = Cart.query.get(cart_id)
        
        if not cart:
            return {"message": "Cart not found"}, 404
            
        try:
            schema = CartItemSchema()
            data = schema.load(request.get_json() or {})
            
            # Check if item already exists in cart
            existing_item = CartItem.query.filter_by(
                cart_id=cart_id, 
                product_id=data['product_id']
            ).first()
            
            if existing_item:
                # Update quantity if item already exists
                existing_item.quantity += data['quantity']
                db.session.commit()
                return existing_item.to_dict(), 200
            else:
                # Create new cart item
                item = CartItem(
                    cart_id=cart_id,
                    product_id=data['product_id'],
                    product_name=data['product_name'],
                    quantity=data['quantity'],
                    price=data['price'],
                    image_url=data.get('image_url')
                )
                db.session.add(item)
                db.session.commit()
                return item.to_dict(), 201
                
        except ValidationError as e:
            return {"message": "Invalid input", "errors": e.messages}, 400
        except Exception as e:
            logger.error(f"Error adding item to cart: {str(e)}")
            db.session.rollback()
            return {"message": "An error occurred while adding item to cart"}, 500
    
    def get(self, cart_id):
        """Get all items in a cart"""
        cart = Cart.query.get(cart_id)
        
        if not cart:
            return {"message": "Cart not found"}, 404
            
        return cart.to_dict(), 200
        
    def delete(self, cart_id):
        """Clear all items from a cart"""
        cart = Cart.query.get(cart_id)
        
        if not cart:
            return {"message": "Cart not found"}, 404
            
        # Remove all items from the cart
        CartItem.query.filter_by(cart_id=cart_id).delete()
        db.session.commit()
        
        return {"message": "Cart cleared successfully"}, 200


class CartItemResource(Resource):
    def get(self, cart_id, item_id):
        """Get a specific item from a cart"""
        item = CartItem.query.filter_by(cart_id=cart_id, id=item_id).first()
        
        if not item:
            return {"message": "Item not found in cart"}, 404
            
        return item.to_dict(), 200
        
    def put(self, cart_id, item_id):
        """Update a specific item in a cart"""
        item = CartItem.query.filter_by(cart_id=cart_id, id=item_id).first()
        
        if not item:
            return {"message": "Item not found in cart"}, 404
            
        try:
            schema = CartItemUpdateSchema()
            data = schema.load(request.get_json() or {})
            
            item.quantity = data['quantity']
            db.session.commit()
            
            return item.to_dict(), 200
            
        except ValidationError as e:
            return {"message": "Invalid input", "errors": e.messages}, 400
        except Exception as e:
            logger.error(f"Error updating cart item: {str(e)}")
            db.session.rollback()
            return {"message": "An error occurred while updating cart item"}, 500
    
    def delete(self, cart_id, item_id):
        """Remove an item from a cart"""
        item = CartItem.query.filter_by(cart_id=cart_id, id=item_id).first()
        
        if not item:
            return {"message": "Item not found in cart"}, 404
            
        db.session.delete(item)
        db.session.commit()
        
        return {"message": "Item removed from cart"}, 200


class CartItemByProductResource(Resource):
    def delete(self, cart_id, product_id):
        """Remove a product from a cart by product_id"""
        cart = Cart.query.get(cart_id)
        
        if not cart:
            return {"message": "Cart not found"}, 404
            
        item = CartItem.query.filter_by(cart_id=cart_id, product_id=product_id).first()
        
        if not item:
            return {"message": "Product not found in cart"}, 404
            
        db.session.delete(item)
        db.session.commit()
        
        return {"message": "Product removed from cart"}, 200


def register_routes(api):
    """Register all API routes"""
    api.add_resource(CartsResource, '/api/carts')
    api.add_resource(CartResource, '/api/carts/<string:cart_id>')
    api.add_resource(CartItemsResource, '/api/carts/<string:cart_id>/items')
    api.add_resource(CartItemResource, '/api/carts/<string:cart_id>/items/<int:item_id>')
    api.add_resource(CartItemByProductResource, '/api/carts/<string:cart_id>/products/<int:product_id>')