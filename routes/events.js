const Joi = require('joi');
const { omit } = require('lodash');

const {
  browse,
} = require('../lib/events');
const { resetRequest, resetPassword } = require('../lib/reset');

const event = {
  id: Joi.number(),
  name: Joi.string().max(255),
  description: Joi.string().max(10000),
  start_date: Joi.date(),
  end_date: Joi.date(),
  frequency: Joi.string().max(20),
  location: Joi.string().max(255),
  created_at: Joi.date(),
  updated_at: Joi.date(),
};

const required = Object.assign({}, event, {
  name: Joi.string().required(),
  start_date: Joi.date().required(),
});

module.exports = [
  {
    method: 'GET',
    path: '/events',
    handler: req => browse(req.query),
    config: {
      // auth: {
      //   strategy: 'jwt',
      //   scope: ['USER'],
      // },
      description: 'Query for events',
      notes: 'Query for events',
      tags: ['api', 'events'],
      validate: {
        query: omit(event, ['password']),
      },
    },
  },
  // {
  //   method: 'GET',
  //   path: '/events/{event_id}',
  //   config: {
  //     auth: {
  //       strategy: 'jwt',
  //       scope: ['USER'],
  //     },
  //     handler: req => byIdCached(req.params.event_id),
  //     description: 'Gets a event',
  //     notes: 'Returns back the specified event object',
  //     tags: ['api'], // ADD THIS TAG
  //     validate: {
  //       params: {
  //         event_id: Joi.string().uuid().required(),
  //       },
  //     },
  //   },
  // },
  // {
  //   method: 'DELETE',
  //   path: '/events/{event_id}',
  //   config: {
  //     auth: {
  //       strategy: 'jwt',
  //       scope: ['USER'],
  //     },
  //     handler: req => del(req.params.event_id),
  //     description: 'Deletes a User',
  //     notes: 'Deletes a event',
  //     tags: ['api'], // ADD THIS TAG
  //     validate: {
  //       params: {
  //         event_id: Joi.string().uuid().required(),
  //       },
  //     },
  //   },
  // },
  // {
  //   method: 'GET',
  //   path: '/events/count',
  //   config: {
  //     auth: {
  //       strategy: 'jwt',
  //       scope: ['USER'],
  //     },
  //     handler: count,
  //     description: 'Checks Authentication',
  //     notes: 'Returns back the settings of your authentication',
  //     tags: ['api'], // ADD THIS TAG
  //   },
  // },
  // {
  //   method: 'GET',
  //   path: '/events/new_signups',
  //   config: {
  //     auth: {
  //       strategy: 'jwt',
  //       scope: ['USER'],
  //     },
  //     handler: neweventsCached,
  //     description: 'Gets newly signed up events',
  //     tags: ['api'], // ADD THIS TAG
  //   },
  // },
  // {
  //   method: 'POST',
  //   path: '/events',
  //   handler: req => add(req.payload),
  //   config: {
  //     auth: false,
  //     description: 'Add A User',
  //     notes: 'Adds a User',
  //     tags: ['api', 'events'],
  //     validate: {
  //       payload: omit(required, ['id']),
  //     },
  //   },
  // },
  // {
  //   method: 'PUT',
  //   path: '/events/validate/{token}',
  //   handler: req => validate(req.params.token),
  //   config: {
  //     auth: false,
  //     description: 'Validate User',
  //     notes: 'Based off of a token, this will validate a event',
  //     tags: ['api', 'events'],
  //     validate: {
  //       params: {
  //         token: Joi.string().uuid().required(),
  //       },
  //     },
  //   },
  // },
  // {
  //   method: 'PUT',
  //   path: '/events/reset/{token}',
  //   handler: req => resetPassword(req.params.token, req.payload.password),
  //   config: {
  //     auth: false,
  //     description: 'Resets Password',
  //     notes: 'Based off of a token, this will reset a password',
  //     tags: ['api', 'events'],
  //     validate: {
  //       params: {
  //         token: Joi.string().uuid().required(),
  //       },
  //       payload: {
  //         password: Joi.string().regex(/^[a-zA-Z0-9]{6,1000}$/).required(),
  //         verify_password: Joi.any()
  //           .valid(Joi.ref('password'))
  //           .required()
  //           .options({
  //             language: {
  //               any: {
  //                 allowOnly: 'must match password'
  //               }
  //             }
  //           })
  //       }
  //     },
  //   },
  // },
  // {
  //   method: 'POST',
  //   path: '/events/reset',
  //   handler: req => resetRequest(req.payload.email),
  //   config: {
  //     auth: false,
  //     description: 'Request Password Reset',
  //     notes: 'Based off of an email, requests a password reset for a event',
  //     tags: ['api', 'events'],
  //     validate: {
  //       payload: {
  //         email: Joi.string().required(),
  //       }
  //     },
  //   },
  // }
];
