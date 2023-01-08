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
const { destroyRecords, getAuthToken, fixtures } = require('../../fixture-client');
const { users } = require('../../fixtures');
const knex = require('../../../knex');

lab.experiment('POST /events', () => {
  let Authorization;

  lab.before(async () => {
    await knex('users').insert(users);
    const authRes = await getAuthToken(users[0]);
    Authorization = authRes.token;
  });

  lab.after(() => {
    return destroyRecords({ users });
  });

  lab.test('should create an event', async () => {
    const e = {
      name: 'Laser Class Test',
      // description: 'Join this class!\r\nIt\'s fun!',
      start_date: new Date('2019-11-11 13:00:00'),
      // end_date: '2019-10-11 15:00:00',
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
});
