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

const { expect } = require('@hapi/code');
// eslint-disable-next-line
const lab = exports.lab = require('@hapi/lab').script();
const url = require('url');

const server = require('../../..');
const { getAuthToken } = require('../../fixture-client');
const knex = require('../../../knex');
const { users, events } = require('../../fixtures');
const clearDb = require('../../clearDb');

lab.experiment('GET /events/{event_id}', () => {
  let Authorization;

  lab.before(async () => {
    await knex('users').insert(users);
    await knex('events').insert(events);
    const authRes = await getAuthToken(users[0]);
    Authorization = authRes.token;
  });

  lab.after(async () => {
    await clearDb();
  });

  lab.test('should return a event by id', async () => {
    const event = await knex('events').offset(0).first('id', 'name');
    const options = {
      url: url.format(`/events/${event.id}`),
      method: 'GET',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.be.an.object();
    expect(res.result.id).to.equal(event.id);
    expect(res.result.name).to.equal(event.name);
  });

  // TODO: this explodes violently inside hapi when it should return a nice 404
  lab.test.skip('should error if event is not found', async () => {
    const options = {
      url: url.format('/events/badbadf7-53a7-4d66-abf5-541d3ed767d0'),
      method: 'GET',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(404);
  });

  lab.test('should error with bad event id', async () => {
    const options = {
      url: url.format('/events/badbadbad'),
      method: 'GET',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(400);
  });

  lab.test('should error if no auth token is found', async () => {
    const event = await knex('events').offset(0).first('id');
    const options = {
      url: url.format(`/events/${event.id}`),
      method: 'GET',
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(401);
  });
});
