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

const debug = require('debug')('events');
const bread = require('./bread');

const cache = require('./cache');
const { allEvents } = require('./queries');

const eventFields = [
  'id',
  'name',
  'description',
  'start_date',
  'end_date',
  'frequency',
  'location',
  'is_deleted',
  'created_at',
  'updated_at',
  'deleted_at',
];

function del(id) {
  const filter = {
    id,
    is_deleted: false,
  };

  return knex('events')
    .where(filter)
    .update({
      is_deleted: true,
    })
    .returning(['id', 'is_deleted'])
    .catch((err) => {
      debug(err);
      return throwDatabaseError(err);
    })
    .then((row) => {
      if (row.length !== 1) {
        return throwNotFound();
      }
      return row[0];
    });
}

async function byId(id) {
  const event = await bread.read('events', null, { id });
  if (event) {
    return event;
  }
  return null;
}

async function byIdCached(id) {
  const event = await cache.getOrStore({ segment: 'EVENT', id: String(id) }, null, byId, id);
  if (event) {
    return event;
  }
  return throwNotFound();
}

function clearCache(id) {
  return cache.drop({ segment: 'EVENT', id: String(id) });
}

function browse(query) {
  return bread.browse('events', eventFields, {});
}

module.exports = {
  del,
  byId,
  byIdCached,
  clearCache,
  browse
};
