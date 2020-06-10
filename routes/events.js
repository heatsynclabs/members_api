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
  del,
  byIdCached
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
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      description: 'Query for events',
      notes: 'Query for events',
      tags: ['api', 'events'],
      validate: {
        query: omit(event, ['password']),
      },
    },
  },
  {
    method: 'GET',
    path: '/events/{event_id}',
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      handler: req => byIdCached(req.params.event_id),
      description: 'Gets a event',
      notes: 'Returns back the specified event object',
      tags: ['api'], // ADD THIS TAG
      validate: {
        params: {
          event_id: Joi.string().uuid().required(),
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/events/{event_id}',
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      handler: req => del(req.params.event_id),
      description: 'Deletes an Event',
      notes: 'Deletes an Event',
      tags: ['api'], // ADD THIS TAG
      validate: {
        params: {
          event_id: Joi.string().uuid().required(),
        },
      },
    },
  },
  //TODO: CREATE,UPDATE
];
