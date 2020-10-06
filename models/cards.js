const Joi = require('joi');
const breadModel = require('../lib/breadModel');

const model = breadModel({
  name: 'cards',
  schema: {
    id: Joi.number().integer().required(),
    user_id: Joi.string().uuid().required(),
    card_number: Joi.string(),
    note: Joi.string(),
    permissions: Joi.number(),
  },
});

module.exports = model;
