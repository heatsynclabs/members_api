const debug = require('debug')('certs');
const bread = require('./bread');

const cache = require('./cache');

const {
  throwDatabaseError,
  throwNotFound,
  throwAuthError
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
