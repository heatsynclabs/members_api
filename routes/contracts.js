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
  browse,
  add,
  edit,
  del,
  byIdCached
} = require('../lib/contracts');
const { resetRequest, resetPassword } = require('../lib/reset');

const contract = {
  id: Joi.number(),
  user_id: Joi.string().uuid(),

  first_name: Joi.string().max(255),
  last_name: Joi.string().max(255),
  cosigner: Joi.string().max(255),
  signed_at: Joi.date(),
  document_file_name: Joi.string().max(255),

  created_by: Joi.string().uuid(),

  is_deleted: Joi.boolean(),
  created_at: Joi.date(),
  updated_at: Joi.date(),
};

const required = Object.assign({}, contract, {
  first_name: Joi.string().required(),
  signed_at: Joi.date().required(),
});

module.exports = [
  {
    method: 'GET',
    path: '/contracts',
    handler: req => browse(req.query),
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      description: 'Query for contracts',
      notes: 'Query for contracts',
      tags: ['api', 'contracts'],
      validate: {
        query: omit(contract, ['password']),
      },
    },
  },
  {
    method: 'GET',
    path: '/contracts/{contract_id}',
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      handler: req => byIdCached(req.params.contract_id),
      description: 'Gets a contract',
      notes: 'Returns back the specified contract object',
      tags: ['api'], // ADD THIS TAG
      validate: {
        params: {
          contract_id: Joi.number().required(),
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/contracts/{contract_id}',
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      handler: req => del(req.params.contract_id),
      description: 'Deletes a Contract',
      notes: 'Deletes a Contract',
      tags: ['api'], // ADD THIS TAG
      validate: {
        params: {
          contract_id: Joi.number().required(),
        },
      },
    },
  },
  {
    method: 'POST',
    path: '/contracts',
    handler: req => add(req.payload),
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      description: 'Add a Contract',
      notes: 'Adds a Contract',
      tags: ['api', 'contracts'],
      validate: {
        payload: omit(required, ['id']),
      },
    },
  },
  {
    method: 'PATCH',
    path: '/contracts/{contract_id}',
    handler: req => edit(req.payload),
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      description: 'Edit a Contract',
      notes: 'Edit a Contract',
      tags: ['api', 'contracts'],
      validate: {
        params: {
          contract_id: Joi.number().required(),
        }
      },
    },
  },
];
