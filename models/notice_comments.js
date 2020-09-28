const Joi = require('joi');
const breadModel = require('../lib/breadModel');

const model = breadModel({
  name: 'notice_comments',
  viewName: 'notice_comments_v',
  schema: {
    id: Joi.number().integer().required(),
    notice_id: Joi.number().integer().required(),
    user_id: Joi.string().uuid().required(),
    comment: Joi.string().max(2000),
  },
  viewOnly: {
    user_name: Joi.string(),
    subject: Joi.string(),
    status: Joi.string(),
    type: Joi.string(),

  }
});

module.exports = model;
