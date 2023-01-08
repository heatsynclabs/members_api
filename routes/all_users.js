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

const { map, omit } = require('lodash');
const boom = require('boom');
const Joi = require('joi');
const { getCreds, isAdmin } = require('../lib/util');
const model = require('../models/all_users');

const strategies = ['auth', 'jwt'];
const omitFields = ['payment_method_id', 'payment_account', 'password'];
const routes = [
  {
    method: 'GET',
    path: '/users/all',
    handler: async (req) => {
      const rows = await model.browse(req.query);
      const admin = isAdmin(req);
      return map(rows, (row) => {
        if (admin) {
          return omit(row, omitFields);
        }
        if (row.email_visible) {
          return omit(row, omitFields);
        }
        return omit(row, omitFields.concat(['email']));
      });
    },
    config: {
      auth: {
        strategies,
        scope: ['USER'],
      },
      description: 'Browse for user',
      notes: 'Browse for user',
      tags: ['api', 'users'],
      validate: {
        query: Joi.object(model.getFullQuerySchema())
      },
    },
  },
  {
    method: 'GET',
    path: '/users/all/{id}',
    config: {
      auth: {
        strategies,
        scope: ['USER'],
      },
      handler: async (req) => {
        const admin = isAdmin(req);
        const creds = getCreds(req);
        const row = await model.read(req.params.id);
        if (!row) {
          return boom.notFound();
        }
        if (admin || row.id === creds.id) {
          return omit(row, ['USER']);
        }
        if (row.email_visible) {
          return omit(row, omitFields);
        }
        return omit(row, omitFields.concat(['email']));
      },
      description: 'Reads a user record by Id',
      notes: 'Reads a user record by Id',
      tags: ['api', 'users'],
      validate: {
        params: Joi.object({
          id: model.schema.id
        }),
      },
    },
  },
];

module.exports = routes;
