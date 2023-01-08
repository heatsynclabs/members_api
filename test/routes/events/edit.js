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

const { expect } = require('code');
// eslint-disable-next-line
const lab = exports.lab = require('lab').script();
const url = require('url');
const { omit } = require('lodash');

const server = require('../../..');
const { createMapRelations, destroyRecords, getAuthToken, fixtures } = require('../../fixture-client');
const { users, events } = require('../../fixtures');
const knex = require('../../../knex');

lab.experiment('PATCH /events/', () => {
  let Authorization;

  lab.before(async () => {
    await knex('users').insert(users);
    await knex('events').insert(await createMapRelations(['created_by'])(events));
    const authRes = await getAuthToken(users[0]);
    Authorization = authRes.token;
  });

  lab.after(async () => {
    const usersToDestroy = await knex('users').select('email', 'id');
    const eventsToDestroy = await knex('events')
      .select('id', 'created_by')
      .where((builder) => builder.whereIn('created_by', usersToDestroy.map(({ id }) => id)));

    await destroyRecords({
      users: usersToDestroy,
      events: eventsToDestroy
    });
  });

  lab.test('should successfully edit an event', async () => {
    const eventsToEdit = await knex('events');
    eventsToEdit[0].name = "fookie";

    const options = {
      url: url.format(`/events/${eventsToEdit[0].id}`),
      method: 'PATCH',
      headers: { Authorization },
      payload: omit(eventsToEdit[0], ['id', 'created_by']),
    };

    const res = await server.inject(options);
    console.log(res);
    expect(res.statusCode).to.equal(200);
    expect(res.result.id).to.equal(eventsToEdit[0].id);
    expect(res.result.name).to.equal('fookie');
  });
});
