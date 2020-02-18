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

const server = require('../../../');
const { destroyRecords, destroyTokens, getAuthToken, fixtures } = require('../../fixture-client');
const { users, events } = require('../../fixtures');

lab.experiment('GET /events/{event_id}', () => {
  let event;
  let event2;
  let authRes;
  let Authorization;

  lab.before(async () => {
    await destroyRecords({ users, events });
    const data = await fixtures.create({ users, events });
    event = data.events[0];
    event2 = data.events[1];
    authRes = await getAuthToken(data.users[0]);
    Authorization = authRes.token;
  });

  lab.after(() => {
    return destroyRecords({ users, events })
      .then(destroyTokens([authRes.id]));
  });

  lab.test('should return a event by id', async () => {
    const options = {
      url: url.format(`/events/${event.id}`),
      method: 'GET',
      headers: { Authorization },
    };


    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.be.an.object();
    expect(res.result.name).to.equal(events[0].name);
    expect(res.result).to.not.include('password');
  });

  // currently everyone can see every event. save this test for later.
  // lab.test('should error if requesting a event not authorized to view', async () => {
  //   const options = {
  //     url: url.format(`/events/${event2.id}`),
  //     method: 'GET',
  //     headers: { Authorization },
  //   };

  //   const res = await server.inject(options);
  //   expect(res.statusCode).to.equal(403);
  //   expect(res.result).to.be.an.object();
  //   expect(res.result).to.not.include('password');
  // });

  lab.test('should error if event is not found', async () => {
    // TODO needs to be an admin
    const options = {
      url: url.format('/events/bada5599-3400-449a-b13c-61ad7ffd1d77'),
      method: 'GET',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(404);
    expect(res.result).to.be.an.object();
  });


  lab.test('should error with invalid event_id', async () => {
    const options = {
      url: url.format('/events/notgood'),
      method: 'GET',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(400);
    expect(res.result).to.be.an.object();
  });
  lab.test('should error if no auth token is found', async () => {
    const options = {
      url: url.format(`/events/${event.id}`),
      method: 'GET',
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(401);
    expect(res.result).to.be.an.object();
  });
});
