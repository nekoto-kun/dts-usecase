'use strict';

import Joi from '@hapi/joi';

// Schema for validating product requests
const productSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow('', null),
  price: Joi.number().precision(2).positive().required(),
  stock: Joi.number().integer().min(0).required(),
  image_url: Joi.string().uri().allow('', null)
});

// Schema for ID parameter
const idSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export {
  idSchema, productSchema
};
