const Joi = require('joi');
const { omit } = require('lodash');

const {
  add,
  count,
  browse,
  validate,
  byIdCached,
  del,
  all,
  newUsersCached
} = require('../lib/users');
const { resetRequest, resetPassword } = require('../lib/reset');

const user = {
  id: Joi.number(),
  email: Joi.string().email().required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{6,1000}$/),
  name: Joi.string().max(255),
  phone:  Joi.string().max(20),
  current_skills: Joi.string().max(1000),
  desired_skills: Joi.string().max(1000),
  waiver: Joi.date(),
  orientation: Joi.date(),
  emergency_name: Joi.string().max(255),
  emergency_phone: Joi.string().max(20),
  emergency_email: Joi.string().email(),
  payment_method_id: Joi.string(),
  payment_account: Joi.string().max(255),
  facebook_url: Joi.string().max(255),
  github_url: Joi.string().max(255),
  twitter_url: Joi.string().max(255),
  website_url: Joi.string().max(255)
};

const required = Object.assign({}, user, {
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

module.exports = [
  {
    method: 'GET',
    path: '/users/me',
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      handler: (req) => {
        return {
          id: req.auth.credentials.id,
          email: req.auth.credentials.email,
        };
      },
      description: 'Checks Authentication',
      notes: 'Returns back the settings of your authentication',
      tags: ['api'], // ADD THIS TAG
    },
  },
  {
    method: 'GET',
    path: '/users/{user_id}',
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      handler: req => byIdCached(req.params.user_id),
      description: 'Gets a user',
      notes: 'Returns back the specified user object',
      tags: ['api'], // ADD THIS TAG
      validate: {
        params: {
          user_id: Joi.string().uuid().required(),
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/users/{user_id}',
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      handler: req => del(req.params.user_id),
      description: 'Deletes a User',
      notes: 'Deletes a user',
      tags: ['api'], // ADD THIS TAG
      validate: {
        params: {
          user_id: Joi.string().uuid().required(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/users/count',
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      handler: count,
      description: 'Checks Authentication',
      notes: 'Returns back the settings of your authentication',
      tags: ['api'], // ADD THIS TAG
    },
  },
  {
    method: 'GET',
    path: '/users/all',
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      handler: all,
      description: 'Gets all users',
      notes: 'Returns back a list of users',
      tags: ['api'], // ADD THIS TAG
    },
  },
  {
    method: 'GET',
    path: '/users/new_signups',
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      handler: newUsersCached,
      description: 'Gets newly signed up users',
      tags: ['api'], // ADD THIS TAG
    },
  },
  {
    method: 'GET',
    path: '/users',
    handler: req => browse(req.query),
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      description: 'Query for Users',
      notes: 'Query for Users',
      tags: ['api', 'users'],
      validate: {
        query: omit(user, ['password']),
      },
    },
  },
  {
    method: 'POST',
    path: '/users',
    handler: req => add(req.payload),
    config: {
      auth: false,
      description: 'Add A User',
      notes: 'Adds a User',
      tags: ['api', 'users'],
      validate: {
        payload: omit(required, ['id']),
      },
    },
  },
  {
    method: 'PUT',
    path: '/users/validate/{token}',
    handler: req => validate(req.params.token),
    config: {
      auth: false,
      description: 'Validate User',
      notes: 'Based off of a token, this will validate a user',
      tags: ['api', 'users'],
      validate: {
        params: {
          token: Joi.string().uuid().required(),
        },
      },
    },
  },
  {
    method: 'PUT',
    path: '/users/reset/{token}',
    handler: req => resetPassword(req.params.token, req.payload.password),
    config: {
      auth: false,
      description: 'Resets Password',
      notes: 'Based off of a token, this will reset a password',
      tags: ['api', 'users'],
      validate: {
        params: {
          token: Joi.string().uuid().required(),
        },
        payload: {
          password: Joi.string().regex(/^[a-zA-Z0-9]{6,1000}$/).required(),
          verify_password: Joi.any()
            .valid(Joi.ref('password'))
            .required()
            .options({
              language: {
                any: {
                  allowOnly: 'must match password'
                }
              }
            })
        }
      },
    },
  },
  {
    method: 'POST',
    path: '/users/reset',
    handler: req => resetRequest(req.payload.email),
    config: {
      auth: false,
      description: 'Request Password Reset',
      notes: 'Based off of an email, requests a password reset for a user',
      tags: ['api', 'users'],
      validate: {
        payload: {
          email: Joi.string().required(),
        }
      },
    },
  }
];
