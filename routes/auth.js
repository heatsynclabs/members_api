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
