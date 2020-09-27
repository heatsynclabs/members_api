const Joi = require('joi');
const breadModel = require('../lib/breadModel');

const model = breadModel({
  name: 'instructors',
  viewName: 'instructors_v',
  schema: {
    id: Joi.number().integer().required(),
    user_id: Joi.string().uuid().required(),
    cert_id: Joi.number().integer().required(),
  },
  viewOnly: {
    user_name: Joi.string(),
    cert_name: Joi.string(),
    last_login: Joi.date(),
  }
});

module.exports = model;
