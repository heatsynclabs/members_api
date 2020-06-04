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
const { destroyRecords, getAuthToken, fixtures } = require('../../fixture-client');
const { users, events } = require('../../fixtures');

lab.experiment('PATCH /events/', () => {
  let sampleEvent;
  let Authorization;

  lab.before(async () => {
    const data = await fixtures.create({ users, events });
    sampleEvent = data.events[0];
    const authRes = await getAuthToken(data.users[0]);
    Authorization = authRes.token;
  });

  lab.after(() => {
    return destroyRecords({ users, events });
  });

  lab.test('should successfully edit an event', async () => {
    sampleEvent['name'] = 'fookie';
    const options = {
      url: url.format(`/events/${sampleEvent.id}`),
      method: 'PATCH',
      headers: { Authorization },
      payload: sampleEvent,
    };
    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(res.result.id).to.equal(sampleEvent.id);
    expect(res.result.name).to.equal('fookie');
  });
});
