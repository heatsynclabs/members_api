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
