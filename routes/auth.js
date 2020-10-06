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
const { omit } = require('lodash');

const {
  login,
  oauthStart,
  oauthCallback,
  oauthTokenLogin,
  emailLogin,
  emailSignupVerify
} = require('../lib/users');

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
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().min(2).max(200).required(),
        }),
      },
    },
  },
  {
    method: 'GET',
    path: '/users/oauth_start',
    handler: async (req, h) => {
      const result = await oauthStart(req.query.mode);
      if (result.rfp) {
        h.response(result).state('r', result.rfp, {
          encoding: 'none',
          strictHeader: false,
          isSameSite: false,
          isSecure: true,
          isHttpOnly: true,
          path: '/'
        });
      }
      return omit(result, ['rfp']);
    },
    config: {
      auth: false,
      description: 'Starts oauth process with list of providers.',
      notes: 'Starts oauth process with list of providers.',
      tags: ['api'],
      validate: {
        query: Joi.object({
          mode: Joi.string()
        })
      },
    },
  },
  {
    method: 'GET',
    path: '/users/oauth',
    handler: async (req, h) => {
      const url = await oauthCallback(req.query);
      // req.cookieAuth.set(omit(tokenData, 'token'));
      return h.redirect(url);
    },
    config: {
      auth: false,
      description: 'Oauth callback',
      notes: 'Oauth callback',
      tags: ['api'],
      validate: {

      },
    },
  },
  {
    method: 'POST',
    path: '/users/oauth_token',
    handler: async (req) => {
      const { token, user } = await oauthTokenLogin(req.payload.token);
      req.cookieAuth.set(omit(token, 'token'));
      user.token = token.token;
      return user;
    },
    config: {
      auth: false,
      description: 'Log In via oauth token',
      notes: 'Log In via oauth token.',
      tags: ['api'],
      validate: {
        payload: Joi.object({
          token: Joi.string().uuid().required(),
        }),
      },
    },
  },
  {
    method: 'POST',
    path: '/users/email_login',
    handler: async (req) => {
      return emailLogin(req.payload.email);
    },
    config: {
      auth: false,
      description: 'Log In via oauth token',
      notes: 'Log In via oauth token.',
      tags: ['api'],
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
        }),
      },
    },
  },
  {
    method: 'GET',
    path: '/users/email_token/{token}',
    handler: async (req, h) => {
      const url = await emailSignupVerify(req.params.token);
      return h.redirect(url);
    },
    config: {
      auth: false,
      description: 'Log In via oauth token',
      notes: 'Log In via oauth token.',
      tags: ['api'],
      validate: {
        params: Joi.object({
          token: Joi.string().uuid().required(),
        }),
      },
    },
  },
  {
    method: 'GET',
    path: '/users/logout',
    handler: async (req) => {
      req.cookieAuth.clear();
      return 'ok';
    },
    config: {
      auth: false,
      description: 'Log out',
      notes: 'Log out.',
      tags: ['api'],
    },
  },
];

module.exports = auth;
