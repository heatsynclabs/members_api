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

const Catbox = require('catbox');
const catboxRedis = require('catbox-redis');
const catboxMemory = require('catbox-memory');
const debug = require('debug')('cache');
const config = require('../config');

const DEFAULT_TTL = config.cache.ttl || 1000 * 60 * 60 * 24 * 7; // a week
let client;

if (config.cache.type === 'redis') {
  client = new Catbox.Client(catboxRedis, config.cache.options);
} else {
  client = new Catbox.Client(catboxMemory, config.cache.options);
}

client.start((err) => {
  if (err) {
    debug('error initializing cache', err);
  }
});

async function get(key) {
  const result = await client.get(key);
  return result.item;
}

async function getAndStore(key, ttl, getFunc, ...args) {
  const data = await getFunc.apply(this, args);
  client.set(key, data, ttl || DEFAULT_TTL);
  return data;
}

/* eslint no-unused-vars: "off" */
function getOrStore(key, ttl, getFunc) {
  const args = arguments;
  return get(key)
    .catch(() => getAndStore.apply(this, args));
}

module.exports = {
  get,
  set: client.set.bind(client),
  drop: client.drop.bind(client),
  getOrStore,
  getAndStore,
  DEFAULT_TTL,
};
