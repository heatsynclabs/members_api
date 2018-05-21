const debug = require('debug')('users');
const {
  without,
  omit,
  isUndefined,
  omitBy
} = require('lodash');
const bread = require('./bread');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const knex = require('../knex');
const cache = require('./cache');
const config = require('../config');
const createValidation = require('./create_validation');
const { authRequest, allUsers, newUsers: newUsersQuery } = require('./queries');

const STATS_TTL = 1000 * 60 * 10; //ten minutes

const {
  throwDatabaseError,
  throwNotFound,
  throwAuthError
} = require('../lib/errors');

const userFields = [
  'id',
  'password',
  'email',
  'is_validated',
  'is_deleted',
  'version',
];

function del(id) {
  const filter = {
    id,
    is_deleted: false,
  };

  return knex('users')
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
  const fields = [
    'id',
    'email',
    'created_at',
    'is_validated'
  ];

  const filter = omitBy({
    email: query.email,
    is_deleted: false,
  }, isUndefined);

  return bread.browse('users', fields, filter);
}

function all() {
  return bread.raw(allUsers);
}

async function add(data) {
  const fields = [
    'id',
    'email',
    'password',
  ];
  const password = await bcrypt.hash(data.password, 10);
  const userData = omitBy({
    email: data.email,
    password,
  }, isUndefined);

  // console.log('add', userData);
  try {
    const breadAdd = await bread.add('users', fields, userData);
    await createValidation(breadAdd, fields);
    return { id: breadAdd.id };
  } catch (err) {
    // console.log('users_add', err);
    return err;
  }
}

async function validateJWT(decoded) {
  const user = await byIdCached(decoded.id);
  if (user && decoded.version >= user.version && !user.is_deleted) {
    return { isValid: true };
  }
  return { isValid: false };
}

/* eslint object-curly-newline: "off" */
function getToken({ id, email, version, scope, name }) {
  return Object.assign({ id, email, version, scope, name }, {
    token: jwt.sign({ id, email, version, scope }, config.jwt.password, config.jwt.signOptions),
  });
}

async function login(email, password) {
  const [res] = await bread.raw(authRequest, [email]);
  const userData = omit(res, ['password']);
  if (!userData.is_validated) {
    throw unverified();
  }
  const isValid = await bcrypt.compare(password, res.password);
  if (!isValid) {
    debug('Unauthorized User');
    throw unauthorized();
  }
  // console.log('userData', userData);
  userData.scope.push('USER');
  return getToken(userData);
}

async function count() {
  const results = await bread.raw('select count(*) from users;');
  console.log('results', results);
  return results[0];
}

async function countCached() {
  const result = await cache.getOrStore({ segment: 'USER_STATS', id: 'COUNT' }, STATS_TTL, count);
  return result;
}

async function newUsers() {
  const results = await bread.raw(newUsersQuery);
  console.log('results', results);
  return results;
}

async function newUsersCached() {
  const result = await cache.getOrStore({ segment: 'USER_STATS', id: 'NEW_USERS' }, STATS_TTL, newUsers);
  return result;
}



async function validate(token) {
  const tokenFields = [
    'user_id',
    'token_type',
    'used_at',
    'id',
  ];

  return knex.transaction((trx) => {
    async function returnsAsync() {
      const transaction1 = await trx('time_token')
        .returning(tokenFields)
        .where({ id: token })
        .update({
          used_at: knex.fn.now(),
        });
      const queryResult = await trx('users')
        .returning(['id', 'email', 'version'])
        .where({ id: transaction1[0].user_id })
        .update({
          is_validated: true,
        });
      // TODO get this from groups
      queryResult[0].scope = ['USER'];
      return getToken(queryResult[0]);
    }
    try {
      return returnsAsync();
    } catch (err) {
      return trx.rollback();
    }
  });
}

module.exports = {
  browse,
  add,
  all,
  del,
  byId,
  byIdCached,
  clearCache,
  validateJWT,
  login,
  count,
  countCached,
  validate,
  newUsersCached
};
