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
const { events } = require('../../fixtures');

lab.experiment('DELETE /events/', () => {
  let sampleEvent;

  lab.before(async () => {
    const data = await fixtures.create({ events });
    sampleEvent = data.events[0];
  });

  lab.after(() => {
    return destroyRecords({ events });
  });

  lab.test('should successfully delete an event', async () => {
    const options = {
      url: url.format(`/events/${event.id}`),
      method: 'DELETE',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(res.result.id).to.equal(event.id);
    expect(res.result.is_deleted).to.equal(true);
  });
});
