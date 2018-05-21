const Joi = require('joi');

const { login } = require('../lib/users');

const auth = [
  {
    method: 'POST',
    path: '/auth',
    handler: req => login(req.payload.email, req.payload.password),
    config: {
      auth: false,
      description: 'Log In',
      notes: 'Logs into the server with the email and password, requests the placement of a quicky and auth token.',
      tags: ['api'],
      validate: {
        payload: {
          email: Joi.string().email().required(),
          password: Joi.string().min(2).max(200).required(),
        },
      },
    },
  },
];

module.exports = auth;
