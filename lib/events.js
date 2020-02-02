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
  'created_at',
  'updated_at'
];

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
  byId,
  byIdCached,
  clearCache,
  browse
};
