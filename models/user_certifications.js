const Joi = require('joi');
const breadModel = require('../lib/breadModel');

const model = breadModel({
  name: 'user_certifications',
  viewName: 'user_certifications_v',
  schema: {
    id: Joi.number().integer().required(),
    user_id: Joi.string().uuid().required(),
    cert_id: Joi.number().integer().required(),
    note: Joi.string(),
    created_by: Joi.string().uuid(),
  },
  viewOnly: {
    user_name: Joi.string(),
    cert_name: Joi.string(),
    last_login: Joi.date(),
  }
});

module.exports = model;
