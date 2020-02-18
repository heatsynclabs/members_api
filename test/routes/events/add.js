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

const server = require('../../../');
const { destroyRecords, destroyTokens, getAuthToken, fixtures } = require('../../fixture-client');
const { users, events } = require('../../fixtures');
const { databaseError } = require('../../../lib/errors');

lab.experiment('POST /events', () => {
  let user;
  let authRes;
  let Authorization;

  lab.before(async () => {
    await destroyRecords({ users, events });
    const data = await fixtures.create({ users });
    user = data.users[0];
    authRes = await getAuthToken(data.users[0]);
    Authorization = authRes.token;
  });

  lab.after(() => {
    return destroyRecords({ users, events })
      .then(destroyTokens([authRes.id]));
  });

  lab.test('should create a event', async () => {
    const event = omit(events[0], ['id']);
    const options = {
      url: url.format('/events'),
      method: 'POST',
      payload: event,
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.be.an.object();
    expect(res.result).to.include('id');
  });

  lab.test('should error with missing name', async () => {
    const event = omit(events[1], ['id','name']);
    const options = {
      url: url.format('/events'),
      method: 'POST',
      payload: event,
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(400);
  });

  lab.test('should error with missing start_date', async () => {
    const event = omit(events[1], ['id','start_date']);
    const options = {
      url: url.format('/events'),
      method: 'POST',
      payload: event,
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(400);
  });

  lab.test('should error with duplicate name and start date', async () => {
    const event = omit(events[0], ['id']);
    const options = {
      url: url.format('/events'),
      method: 'POST',
      payload: event,
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(422);
    expect(res.result).to.be.an.object();
  });

  lab.test('should error with no auth', async () => {
    const event = omit(events[1], ['id']);
    const options = {
      url: url.format('/events'),
      method: 'POST',
      payload: event,
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(401);
  });

});
