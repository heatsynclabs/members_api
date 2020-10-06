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

const Fixtures = require('sql-fixtures');
const { forEach, keys, values } = require('lodash');
const promise = require('bluebird');
const debug = require('debug')('errors');
const url = require('url');
const server = require('../');
const { connection } = require('../knexfile');
const knex = require('../knex');

const fixturesConfig = {
  client: 'pg',
  connection,
};

const fixtures = new Fixtures(fixturesConfig);

const deleteOrder = [
  'time_token',
  'events',
  'users',
];

module.exports = {
  destroyRecords(tables) {
    // console.log('destroying records');
    const deleteRecords = [];

    forEach(deleteOrder, (tableName) => {
      if (tables[tableName]) {
        deleteRecords.push({ [tableName]: [] });
        forEach(tables[tableName], (record) => {
          let key = 'id';
          if (tableName === 'users') {
            key = 'email';
          }
          deleteRecords[deleteRecords.length - 1][tableName].push(record[key]);
        });
      }
    });

    return promise.each(deleteRecords, (table) => {
      const tableName = keys(table)[0];
      const ids = values(table)[0];
      let key = 'id';

      if (tableName === 'users') {
        key = 'email';
      }

      return knex(tableName)
        .whereIn(key, ids)
        .del()
        .then(() => tableName)
        .catch((err) => {
          debug('Fixtures delete err => ', err);
          return Promise.reject(err);
        });
    });
  },
  async destroyTokens(userIds) {
    return promise.each(userIds, id => knex('time_token')
      .where('user_id', id)
      .del()
      .then(() => id));
  },
  async getAuthToken(user) {
    const options = {
      url: url.format('/auth'),
      method: 'POST',
      payload: {
        email: user.email,
        password: 'password',
      },
    };
    const res = await server.inject(options);
    if (res.statusCode !== 200) {
      return Promise.reject();
    }
    return res.result;
  },
  fixtures,
};
