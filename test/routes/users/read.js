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
const { destroyRecords, getAuthToken } = require('../../fixture-client');
const { users } = require('../../fixtures');
const knex = require('../../../knex');

lab.experiment('GET /users/{user_id}', () => {
  let Authorization;

  lab.before(async () => {
    await knex('users').insert(users);
    const authRes = await getAuthToken(users[0]);
    Authorization = authRes.token;
  });

  lab.after(() => {
    return destroyRecords({ users });
  });

  lab.test('should return a user by id', async () => {
    const user = await knex('users').offset(0).first('email', 'id');
    const options = {
      url: url.format(`/users/${user.id}`),
      method: 'GET',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.be.an.object();
    expect(res.result.email).to.equal(user.email);
    expect(res.result).to.not.include('password');
  });

  lab.test('should error if requesting a user not authorized to view', async () => {
    const user2 = await knex('users').offset(1).first('id');
    const options = {
      url: url.format(`/users/${user2.id}`),
      method: 'GET',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(403);
    expect(res.result).to.be.an.object();
    expect(res.result).to.not.include('password');
  });

  lab.test.skip('should error if user is not found', async () => {
    // TODO needs to be an admin
    const options = {
      url: url.format('/users/bada5599-3400-449a-b13c-61ad7ffd1d77'),
      method: 'GET',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(404);
    expect(res.result).to.be.an.object();
  });

  lab.test('should error with invalid user_id', async () => {
    const options = {
      url: url.format('/users/notgood'),
      method: 'GET',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(400);
    expect(res.result).to.be.an.object();
  });
  lab.test('should error if no auth token is found', async () => {
    const user = await knex('users').offset(0).first('id');
    const options = {
      url: url.format(`/users/${user.id}`),
      method: 'GET',
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(401);
    expect(res.result).to.be.an.object();
  });
});
