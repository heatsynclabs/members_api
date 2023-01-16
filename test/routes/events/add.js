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
const { destroyRecords, getAuthToken, fixtures, makeUserIdAdmin } = require('../../fixture-client');
const { users } = require('../../fixtures');
const knex = require('../../../knex');

lab.experiment('POST /events', () => {
  let Authorization;
  let myUserId;
  let memberships;
  let events;

  lab.before(async () => {
    let insertedUserIds = await knex('users').insert(users).returning(['id']);
    myUserId = insertedUserIds[0]['id'];

    await makeUserIdAdmin(myUserId);

    const authRes = await getAuthToken(users[0]);
    Authorization = authRes.token;
  });

  lab.after(() => {
    return destroyRecords({ memberships }).then(destroyRecords({ events })).then(destroyRecords({ users }));
  });

  lab.test('should create an event with appropriate created_by', async () => {
    const e = {
      name: 'Laser Class Testy',
      start_date: new Date('2019-11-11 13:00:00'),
      frequency: 'weekly',
      location: 'HeatSync Labs',
    };

    const options = {
      url: url.format('/events'),
      method: 'POST',
      payload: e,
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.be.an.object();
    expect(res.result).to.include('id');

    // now get
    const options2 = {
      url: url.format({
        pathname: '/events',
      }),
      method: 'GET',
      headers: { Authorization },
    };

    const res2 = await server.inject(options2);
    expect(res2.statusCode).to.equal(200);
    expect(res2.result).to.be.an.array();
    expect(res2.result[res2.result.length-1].name).to.equal('Laser Class Testy');
    expect(res2.result[res2.result.length-1].created_by).to.equal(myUserId);
    expect(res2.result[res2.result.length-1].created_at).to.not.equal(null);
    expect(res2.result[res2.result.length-1].deleted_at).to.equal(null);
    expect(res2.result[res2.result.length-1].is_deleted).to.equal(false);
  });

  lab.test('should error with missing name', async () => {
    const e = {
      start_date: new Date('2019-11-11 13:00:00'),
      frequency: 'weekly',
      location: 'HeatSync Labs',
    };

    const options = {
      url: url.format('/events'),
      method: 'POST',
      payload: e,
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(400);
  });

  lab.test('should error with missing start_date', async () => {
    const e = {
      name: 'Laser Class Test',
      frequency: 'weekly',
      location: 'HeatSync Labs',
    };

    const options = {
      url: url.format('/events'),
      method: 'POST',
      payload: e,
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(400);
  });

  lab.test('should error if protected details like created_by are provided', async () => {
    const e = {
      name: 'Laser Class Test',
      frequency: 'weekly',
      location: 'HeatSync Labs',
      created_by: 'users:0',
    };

    const options = {
      url: url.format('/events'),
      method: 'POST',
      payload: e,
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(400);
  });

  lab.test('should error with no auth', async () => {
    const e = {
      name: 'Laser Class Test',
      start_date: new Date('2019-11-11 13:00:00'),
      frequency: 'weekly',
      location: 'HeatSync Labs',
    };

    const options = {
      url: url.format('/events'),
      method: 'POST',
      payload: e,
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(401);
  });
});
