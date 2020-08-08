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

const debug = require('debug')('certs');
const bread = require('./bread');

const cache = require('./cache');

const {
  throwDatabaseError,
  throwNotFound
} = require('../lib/errors');

const certFields = [
  'id',
  'name',
  'description',
  'created_at',
  'updated_at'
];

async function byId(id) {
  const user = await bread.read('users', without(userFields, 'password'), { id });
  if (user) {
    return user;
  }
  return null;
}

async function byIdCached(id) {
  const user = await cache.getOrStore({ segment: 'USER', id: String(id) }, null, byId, id);
  if (user) {
    return user;
  }
  return throwNotFound();
}

function clearCache(id) {
  return cache.drop({ segment: 'USER', id: String(id) });
}

function browse(query) {
  return bread.browse('certifications', certFields, {});
}


async function add(data) {
  const fields = [
    'id',
    'name',
    'description',
  ];
  return bread.add('certifications', fields, data).catch(console.log);
}




module.exports = {
  browse,
  add
};
