'use strict';

import Joi from '@hapi/joi';

// Schema for validating order creation requests
const orderSchema = Joi.object({
  user_id: Joi.string().required(),
  items: Joi.array().items(Joi.object({
    product_id: Joi.number().integer().positive().required(),
    product_name: Joi.string().min(1).max(100).required(),
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().precision(2).positive().required()
  })).min(1).required(),
  shipping_address: Joi.string().required(),
  payment_info: Joi.string().allow('', null)
});

// Schema for validating order status updates
const orderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required()
});

// Schema for ID parameter
const idSchema = Joi.object({
  id: Joi.string().required()
});

// Schema for user ID parameter
const userIdSchema = Joi.object({
  userId: Joi.string().required()
});

// Schema for pagination query params
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

export {
  idSchema, orderSchema,
  orderStatusSchema, paginationSchema, userIdSchema
};
