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
const { Factory } = require('rosie');
const server = require('..');
const { connection } = require('../knexfile');
const knex = require('../knex');

const fixturesConfig = {
  client: 'pg',
  connection,
};

const fixtures = new Fixtures(fixturesConfig);

const tableDeleteOrder = [
  'time_token',
  'memberships',
  'events',
  'users',
];

const tableToDeleteKey = {
  time_token: 'id',
  memberships: 'user_id',
  events: 'name',
  users: 'email'
};

async function mapRelation(relationValue) {
  const [tableName, offset] = relationValue.split(':');
  return (await knex(tableName).offset(offset).first('id')).id;
}

// Replace relation fields in fixtures with ids from real tables
// createMapRelations(['created_by']) creates a function which accepts a
// collection of untransformed fixtures and replaces the `created_by` field
// of each one with the corresponding user id from the database.
function createMapRelations(relationNames) {
  return async function mapRelations(collection) {
    return Promise.all(collection.map(async (item) => ({
      ...item,
      ...(Object
        .fromEntries((
          await Promise.all(
            relationNames
              .map(async (relationName) => mapRelation(item[relationName]))
          ))
          .map((relation, index) => [relationNames[index], relation])))
    })));
  };
}

module.exports = {
  createMapRelations,
  destroyRecords(tables) {
    const deleteRecords = [];

    forEach(tableDeleteOrder, (tableName) => {
      if (tables[tableName]) {
        const key = tableToDeleteKey[tableName];
        deleteRecords.push({ [tableName]: [] });
        forEach(tables[tableName], (record) => {
          deleteRecords[deleteRecords.length - 1][tableName].push(record[key]);
        });
      }
    });

    return promise.each(deleteRecords, (table) => {
      const tableName = keys(table)[0];
      const ids = values(table)[0];
      const key = tableToDeleteKey[tableName];

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
  async makeUserIdAdmin(userId) {
    await knex('groups')
      .insert({ id: 'ADMIN', description: 'Admin users' })
      .onConflict('id')
      .merge();

    const membership = new Factory();
    membership
      .attr('user_id')
      .attr('group_id');

    const memberships = [
      // user 1 will be an admin
      membership.build({
        user_id: userId,
        group_id: 'ADMIN'
      }),
    ];
    await knex('memberships').insert(memberships);
  },
  async destroyTokens(userIds) {
    return promise.each(userIds, (id) => knex('time_token')
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
