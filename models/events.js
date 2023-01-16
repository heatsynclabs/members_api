const Joi = require('joi');
const breadModel = require('../lib/breadModel');

const model = breadModel({
  name: 'events',
  softDelete: true,
  schema: {
    id: Joi.string().uuid().required(),
    name: Joi.string().required(),
    description: Joi.string().allow(null),
    start_date: Joi.date().required(),
    end_date: Joi.date().allow(null),
    location: Joi.string(),
    frequency: Joi.string(),
  },
  viewOnly: {
    created_at: Joi.date(),
    updated_at: Joi.date().allow(null),
    is_deleted: Joi.boolean(),
    deleted_at: Joi.date().allow(null),
    created_by: Joi.string().uuid().required(),
  },
});

module.exports = model;
