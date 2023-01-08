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
const model = require('../models/events');
const { getCreds } = require('../lib/util');

module.exports = [
  {
    method: 'GET',
    path: '/events',
    handler: (req) => model.browse(req.query),
    config: {
      auth: {
        strategies: ['auth', 'jwt'],
        scope: ['USER'],
      },
      description: 'Query for events',
      notes: 'Query for events',
      tags: ['api', 'events'],
      validate: {
        query: Joi.object(model.getFullQuerySchema()).label('eventQueryModel'),
      },
    },
  },
  {
    method: 'GET',
    path: '/events/{event_id}',
    config: {
      auth: {
        strategies: ['auth', 'jwt'],
        scope: ['USER'],
      },
      handler: (req) => model.readCached(req.params.event_id),
      description: 'Gets a event',
      notes: 'Returns back the specified event object',
      tags: ['api'], // ADD THIS TAG
      validate: {
        params: Joi.object({
          event_id: model.schema.id
        }),
      },
    },
  },
  {
    method: 'DELETE',
    path: '/events/{event_id}',
    config: {
      auth: {
        strategies: ['auth', 'jwt'],
        scope: ['USER'],
      },
      handler: (req) => model.remove(req.params.event_id),
      description: 'Deletes an Event',
      notes: 'Deletes an Event',
      tags: ['api'], // ADD THIS TAG
      validate: {
        params: Joi.object({
          event_id: model.schema.id
        }),
      },
    },
  },
  {
    method: 'POST',
    path: '/events',
    handler: (req) => {
      req.payload.created_by = getCreds(req).id;
      return model.add(req.payload);
    },
    config: {
      auth: {
        strategies: ['auth', 'jwt'],
        scope: ['USER'],
      },
      description: 'Add An Event',
      notes: 'Adds an Event',
      tags: ['api', 'events'],
      validate: {
        payload: Joi.object(omit(model.schema, ['id', 'created_by'])).label('eventsAddModel'),
      },
    },
  },
  {
    method: 'PATCH',
    path: '/events/{event_id}',
    handler: (req) => model.edit(req.params.event_id, req.payload),
    config: {
      auth: {
        strategies: ['auth', 'jwt'],
        scope: ['USER'],
      },
      description: 'Edit An Event',
      notes: 'Edit an Event',
      tags: ['api', 'events'],
      validate: {
        params: Joi.object({
          event_id: model.schema.id
        }),
        payload: Joi.object(omit(model.schema, ['id', 'created_by'])),
      },
    },
  },
];
