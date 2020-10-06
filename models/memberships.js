const Joi = require('joi');
const breadModel = require('../lib/breadModel');

const model = breadModel({
  name: 'memberships',
  viewName: 'memberships_v',
  schema: {
    id: Joi.number().integer().required(),
    user_id: Joi.string().uuid().required(),
    group_id: Joi.string().required(),
  },
  viewOnly: {
    user_name: Joi.string(),
    email: Joi.string(),
    last_login: Joi.date(),
  }
});

module.exports = model;
