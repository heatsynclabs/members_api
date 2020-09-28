const Joi = require('joi');
const breadModel = require('../lib/breadModel');

const statuses = [
  'open',
  'closed',
];

const types = [
  'parking_ticket',
  'help',
  'broken',
];

const model = breadModel({
  name: 'notices',
  viewName: 'notices_v',
  schema: {
    id: Joi.number().integer().required(),
    user_id: Joi.string().uuid().required(),
    type: Joi.string().valid(...types),
    status: Joi.string().valid(...statuses),
    subject: Joi.string().max(100),
    comment: Joi.string().max(2000),
    created_by: Joi.string().uuid(),
  },
  viewOnly: {
    user_name: Joi.string(),
  }
});

module.exports = model;
