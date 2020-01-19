const Fixtures = require('sql-fixtures');
const { forEach, keys, values } = require('lodash');
const promise = require('bluebird');
const debug = require('debug')('errors');
const url = require('url');
const server = require('../');
const config = require('../config');
const knex = require('../knex');

const fixturesConfig = {
  client: 'pg',
  connection: config.knex.test,
};

const fixtures = new Fixtures(fixturesConfig);

const deleteOrder = [
  'time_token',
  'users',
];

module.exports = {
  destroyRecords(tables) {
    console.log('destroying records');
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
