from marshmallow import Schema, fields, validate, ValidationError

class CartItemSchema(Schema):
    product_id = fields.Integer(required=True)
    product_name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    quantity = fields.Integer(required=True, validate=validate.Range(min=1))
    price = fields.Float(required=True, validate=validate.Range(min=0.01))
    image_url = fields.String(allow_none=True)

class CartItemUpdateSchema(Schema):
    quantity = fields.Integer(required=True, validate=validate.Range(min=1))

class CartSchema(Schema):
    user_id = fields.String(allow_none=True)
    items = fields.List(fields.Nested(CartItemSchema))