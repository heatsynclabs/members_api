const Joi = require('joi');
const { omit } = require('lodash');

const {
  add,
  browse
} = require('../lib/certs');
const { resetRequest, resetPassword } = require('../lib/reset');

const cert = {
  id: Joi.number(),
  name: Joi.string().max(255).required(),
  description: Joi.string().max(1000)
};

module.exports = [
  {
    method: 'GET',
    path: '/certs',
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      handler: browse,
      description: 'list certifications',
      tags: ['api', 'certs'], // ADD THIS TAG
    },
  },
  {
    method: 'POST',
    path: '/certs',
    handler: req => add(req.payload),
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['ADMIN'],
      },
      description: 'Add A Certification',
      tags: ['api', 'certs'],
      validate: {
        payload: omit(cert, ['id']),
      },
    },
  }
];
