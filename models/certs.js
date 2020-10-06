const Joi = require('joi');
const breadModel = require('../lib/breadModel');

const model = breadModel({
  name: 'certifications',
  schema: {
    id: Joi.number().integer().required(),
    name: Joi.string().max(255).required(),
    description: Joi.string().max(1000),
  },
});

module.exports = model;
