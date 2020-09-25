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

const debug = require('debug')('users');
const {
  without,
  omit,
  isUndefined,
  omitBy,
  forEach
} = require('lodash');
const bread = require('./bread');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { generateId } = require('b64id');
const boom = require('boom');

const knex = require('../knex');
const cache = require('./cache');
const config = require('../config');
const createValidation = require('./create_validation');
const { authRequest, allUsers, newUsers: newUsersQuery } = require('./queries');
const { getRedirUrl, oauthProviders } = require('./oauth_providers');
const { sendLogin, sendEmailSignup } = require('./email');

const STATS_TTL = 1000 * 60 * 10; //ten minutes
const OAUTH_LOGIN_TOKEN_EXIPRES = 1000 * 60 * 10; // ten minutes

const {
  throwDatabaseError,
  throwNotFound,
  throwAuthError,
  throwUnverified
} = require('../lib/errors');
const { server } = require('../config');

const userFields = [
  'id',
  'password',
  'name',
  'scope',
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
  const user = await bread.read('user_groups_v', without(userFields, 'password'), { id });
  // console.log('user byId', id, user);
  if (user) {
    user.scope.push('USER');
    return user;
  }
  return null;
}

async function byEmail(email) {
  // console.log('by email', email);
  const user = await bread.read('user_groups_v', without(userFields, 'password'), { email });
  if (user) {
    user.scope.push('USER');
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

async function add(data, sendValidation) {
  const fields = [
    'id',
    'email',
    'password',
  ];
  const password = await bcrypt.hash(data.password || generateId(), 10);
  const userData = omitBy({
    email: data.email,
    password,
    is_validated: data.is_validated,
    options: data.options,
  }, isUndefined);

  // console.log('adding', userData, fields);
  try {
    const breadAdd = await bread.add('users', fields, userData);
    if(sendValidation) {
      await createValidation(breadAdd, fields);
    }
    
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
    return throwUnverified();
  }
  const isValid = await bcrypt.compare(password, res.password);
  if (!isValid) {
    debug('Unauthorized User');
    return throwAuthError();
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

async function edit(id, userData) {
  const result = await bread.edit('users', '*', userData, {id});
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

const oauthStart = async (mode) => {
  const result = {providers: {}, rfp: generateId()};
  if(Object.keys(config.oauth).length) {
    const stateObj = { rfp: result.rfp, mode };
    const state = jwt.sign(stateObj, config.jwt.password, { expiresIn: '1h' });
    forEach(config.oauth, (val, key) => {
      result.providers[key] = {
        type: key,
        url: getRedirUrl(val, key, `${key}.${state}`)
      };
    });
  }
  return result;
};

const oauthCallback = async (query) => {
  console.log('oauthCallback', query);

  const providerName = query.state.split('.')[0];
  const stateToken = query.state.substring(providerName.length + 1);
  console.log('oauthcallback', providerName, stateToken, config.jwt.password);
  let decoded;
  try {
    decoded =  jwt.verify(stateToken, config.jwt.password);
  } catch(err) {
    console.log('error decoding', err);
    throw err;
  }

  console.log('oauthCallback2', decoded, providerName, query);
  const provider = oauthProviders[providerName];
  if(!provider || !config.oauth[providerName]) {
    return boom.notFound();
  }
  console.log('getting provider user');
  let providerUser;
  try {
    providerUser = await provider.getUser({oauth: config.oauth}, query);
  } catch (err) {
    return `${decoded.mode === 'dev' ? config.domain_dev : config.domain}/oautherror/${escape(err.message)}`;
  }
  console.log('finished getUser', providerUser);
  let user;
  try{
    user = await byEmail(providerUser.email);
  } catch(err){
    console.log('error getting user by email', err);
  }
  if(!user) {
    // console.log('creating new user via oauth');
    const baseUser = omit(providerUser, ['provider', 'providerId', 'avatar']);
    baseUser.last_login = new Date();
    baseUser.options = {providers: {
      [providerName]: {
        avatar: providerUser.avatar,
        id: providerUser.providerId,
        refresh: providerUser.refreshToken, // TODO add refresh tokens
        ts: Date.now()
      }
    }};
    baseUser.options.ll = providerName;
    const toInsert = Object.assign({}, baseUser, {password, is_deleted: false, is_validated: true, version: 10});
    console.log('toinsert', toInsert);
    try {
      user = await add(toInsert);
    }catch(e) {
      console.log('error creating user', e);
      throw e;
    }
    // console.log('new pg user', user);
  } else {
    // console.log('oauth existing user', user);
    user.options = user.options || {}
    user.options.providers = user.options.providers || {};
    user.options.providers[providerName] = {
      avatar: providerUser.avatar,
      id: providerUser.providerId,
      refresh: providerUser.refreshToken, // TODO add refresh tokens
      ts: Date.now()
    }
    user.options.ll = providerName;
    try {
      const updates = {options: user.options, last_login: new Date()};

      if(!user.name && providerUser.name) {
        updates.name = providerUser.name;
      }
      user = await edit(user.id, updates);
      await clearCache(user.id);
      // console.log('updated user', user);
    }catch(e) {
      console.log('error editing user', e);
      throw e;
    }
  }
  console.log('user done', user);

  const  newToken = await bread.add('time_token', '*', {token_type: 'OAUTH', user_id: user.id});
  
  console.log('newToken', newToken);
  
  return `${decoded.mode === 'dev' ? config.domain_dev : config.domain }/login/${newToken.id}`;
};

const oauthTokenLogin = async (id) => {
  // console.log('starting token login', id);
  const tokenRecord = await bread.read('time_token', '*', {id});
  if(!tokenRecord) {
    throw boom.notFound();
  }
  // TODO check token date.
  const now = Date.now();
  const created = (new Date(tokenRecord.created_at)).getTime();
  const elapsed = now - created;
  console.log('oauth token time elapsed', elapsed);

  if(elapsed > OAUTH_LOGIN_TOKEN_EXIPRES) {
    throw boom.notFound();
  }

  const user = await byId(tokenRecord.user_id);

  if(user) {
    await bread.del('time_token', {id: tokenRecord.id});
  } else {
    throw boom.notFound();
  }

  return {user, token: getToken(omit(user, 'password')) };
};

const emailLogin = async (email) => {
  // console.log('starting token login', id);
  const user = await byEmail(email);
  if(!user) {
    const  newToken = await bread.add('time_token', '*', {token_type: 'SIGNUP', email});
    sendEmailSignup(email, newToken.id);
    return {exists: false};
  }

  if (user.is_deleted) {
    throw boom.unauthorized();
  }

  const  newToken = await bread.add('time_token', '*', {token_type: 'LOGIN', user_id: user.id});
  sendLogin(email, newToken.id);

  return {exists: true};
};

const emailSignupVerify = async (id) => {
  const tokenRecord = await bread.read('time_token', '*', {id, token_type: 'SIGNUP'});
  if(!tokenRecord) {
    throw boom.notFound();
  }
  let user = await byEmail(tokenRecord.email);
  if(!user) {
    user = await add({
      email: tokenRecord.email,
      is_validated: true,
      options: {providers: {email: {}}, ll: 'email'}
    });
    const  newToken = await bread.add('time_token', '*', {token_type: 'LOGIN', user_id: user.id});
    return `${config.domain}/login/${newToken.id}`;
  } else {
    throw boom.unauthorized();
  }
};

module.exports = {
  browse,
  add,
  all,
  del,
  byId,
  byEmail,
  byIdCached,
  clearCache,
  validateJWT,
  login,
  count,
  countCached,
  validate,
  newUsersCached,
  oauthStart,
  oauthCallback,
  oauthTokenLogin,
  emailLogin,
  emailSignupVerify,
};
