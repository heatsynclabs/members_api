const Joi = require('joi');
const breadModel = require('../lib/breadModel');

const model = breadModel({
  name: 'events',
  softDelete: true,
  schema: {
    id: Joi.string().uuid().required(),
    name: Joi.string(),
    description: Joi.string(),
    start_date: Joi.date(),
    end_date: Joi.date(),
    location: Joi.string(),
    frequency: Joi.string(),
    is_deleted: Joi.boolean(),
    deleted_at: Joi.date(),
    created_by: Joi.string().uuid().required(),
  },
});

module.exports = model;
