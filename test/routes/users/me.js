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
const knex = require('../../../knex');

const server = require('../../..');
const { destroyRecords, getAuthToken, fixtures } = require('../../fixture-client');
const { users } = require('../../fixtures');

lab.experiment('GET /user/me', () => {
  let user;
  let Authorization;

  lab.before(async () => {
    await knex('users').insert(users);
    const authRes = await getAuthToken(users[0]);

    user = await knex('users').first('id', 'email');
    Authorization = authRes.token;
  });

  lab.after(async () => {
    await destroyRecords({ users });
  });

  lab.test('should retrieve my information when logged in', async () => {
    const options = {
      url: url.format({ pathname: '/users/me' }),
      method: 'GET',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(res.result.id).to.equal(user.id);
    expect(res.result.email).to.equal(user.email);
  });

  lab.test('Give unauthorized error when not passing valid credentials', (done) => {
    const options = {
      url: url.format({ pathname: '/users/me' }),
      method: 'GET',
    };

    server.inject(options, (res) => {
      expect(res.statusCode).to.equal(401);
      done();
    });
  });
});
