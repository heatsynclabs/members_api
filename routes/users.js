// Copyright 2019 Iced Development, LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const Joi = require('joi');
const { omit, pick } = require('lodash');

const {
  add,
  count,
  browse,
  validate,
  byIdCached,
  del,
  newUsersCached
} = require('../lib/users');
const { resetRequest, resetPassword } = require('../lib/reset');

const user = {
  id: Joi.number(),
  email: Joi.string().email().required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{6,1000}$/),
  name: Joi.string().max(255),
  phone: Joi.string().max(20),
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

const required = {
  ...user,
  password: Joi.string().required(),
  email: Joi.string().email().required(),
};

module.exports = [
  {
    method: 'GET',
    path: '/users/me',
    config: {
      auth: {
        strategies: ['auth', 'jwt'],
        scope: ['USER'],
      },
      handler: (req) => {
        // console.log('me', req.auth);
        if (Array.isArray(req.auth.credentials)) {
          return pick(req.auth.credentials[0], ['email', 'scope', 'id', 'name']);
        }
        return pick(req.auth.credentials, ['email', 'scope', 'id', 'name']);
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
        strategies: ['auth', 'jwt'],
        scope: ['USER'],
      },
      handler: (req) => byIdCached(req.params.user_id),
      description: 'Gets a user',
      notes: 'Returns back the specified user object',
      tags: ['api'], // ADD THIS TAG
      validate: {
        params: Joi.object({
          user_id: Joi.string().uuid().required(),
        }),
      },
    },
  },
  {
    method: 'DELETE',
    path: '/users/{user_id}',
    config: {
      auth: {
        strategies: ['auth', 'jwt'],
        scope: ['USER'],
      },
      handler: (req) => del(req.params.user_id),
      description: 'Deletes a User',
      notes: 'Deletes a user',
      tags: ['api'], // ADD THIS TAG
      validate: {
        params: Joi.object({
          user_id: Joi.string().uuid().required(),
        }),
      },
    },
  },
  {
    method: 'GET',
    path: '/users/count',
    config: {
      auth: {
        strategies: ['auth', 'jwt'],
        scope: ['USER'],
      },
      handler: count,
      description: 'Checks Authentication',
      notes: 'Returns back the settings of your authentication',
      tags: ['api'], // ADD THIS TAG
    },
  },
  // {
  //   method: 'GET',
  //   path: '/users/all',
  //   config: {
  //     auth: {
  //       strategies: ['auth', 'jwt'],
  //       scope: ['USER'],
  //     },
  //     handler: all,
  //     description: 'Gets all users',
  //     notes: 'Returns back a list of users',
  //     tags: ['api'], // ADD THIS TAG
  //   },
  // },
  {
    method: 'GET',
    path: '/users/new_signups',
    config: {
      auth: {
        strategies: ['auth', 'jwt'],
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
    handler: (req) => browse(req.query),
    config: {
      auth: {
        strategies: ['auth', 'jwt'],
        scope: ['USER'],
      },
      description: 'Query for Users',
      notes: 'Query for Users',
      tags: ['api', 'users'],
      validate: {
        query: Joi.object(omit(user, ['password'])),
      },
    },
  },
  {
    method: 'POST',
    path: '/users',
    handler: (req) => add(req.payload),
    config: {
      auth: false,
      description: 'Add A User',
      notes: 'Adds a User',
      tags: ['api', 'users'],
      validate: {
        payload: Joi.object(omit(required, ['id'])),
      },
    },
  },
  {
    method: 'PUT',
    path: '/users/validate/{token}',
    handler: (req) => validate(req.params.token),
    config: {
      auth: false,
      description: 'Validate User',
      notes: 'Based off of a token, this will validate a user',
      tags: ['api', 'users'],
      validate: {
        params: Joi.object({
          token: Joi.string().uuid().required(),
        }),
      },
    },
  },
  {
    method: 'PUT',
    path: '/users/reset/{token}',
    handler: (req) => resetPassword(req.params.token, req.payload.password),
    config: {
      auth: false,
      description: 'Resets Password',
      notes: 'Based off of a token, this will reset a password',
      tags: ['api', 'users'],
      validate: {
        params: Joi.object({
          token: Joi.string().uuid().required(),
        }),
        payload: Joi.object({
          password: Joi.string().regex(/^[a-zA-Z0-9]{6,1000}$/).required(),
          verify_password: Joi.any().valid(Joi.ref('password')).required()
        })
      },
    },
  },
  {
    method: 'POST',
    path: '/users/reset',
    handler: (req) => resetRequest(req.payload.email),
    config: {
      auth: false,
      description: 'Request Password Reset',
      notes: 'Based off of an email, requests a password reset for a user',
      tags: ['api', 'users'],
      validate: {
        payload: Joi.object({
          email: Joi.string().required(),
        })
      },
    },
  }
];
