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

const server = require('../../..');
const knex = require('../../../knex');

const { createMapRelations, destroyRecords, getAuthToken } = require('../../fixture-client');
const { events, users } = require('../../fixtures');

lab.experiment('DELETE /events/', () => {
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

  lab.test('should successfully delete an event', async () => {
    const sampleEvent = await knex('events').first('id', 'is_deleted');
    const options = {
      url: url.format(`/events/${sampleEvent.id}`),
      method: 'DELETE',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(res.result.id).to.equal(sampleEvent.id);
    expect(res.result.is_deleted).to.equal(true);
  });
});
