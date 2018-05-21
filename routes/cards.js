const Joi = require('joi');
const { omit } = require('lodash');

const {
  all
} = require('../lib/cards');

const cert = {
  id: Joi.number(),
  name: Joi.string().max(255).required(),
  description: Joi.string().max(1000)
};

module.exports = [
  {
    method: 'GET',
    path: '/cards',
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['ADMIN'],
      },
      handler: all,
      description: 'list cards',
      tags: ['api', 'cards'], // ADD THIS TAG
    },
  }
];
