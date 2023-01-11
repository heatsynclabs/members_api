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

lab.experiment.skip('GET /events/', () => {
  let Authorization;
  let data;

  lab.before(async () => {
    data = await fixtures.create({ users, events });
    const authRes = await getAuthToken(data.users[0]);
    Authorization = authRes.token;
  });

  lab.after(() => {
    return destroyRecords(data);
  });

  lab.test('should retrieve event information when logged in', (done) => {
    const options = {
      url: url.format({
        pathname: '/events',
      }),
      method: 'GET',
      headers: { Authorization },
    };

    server.inject(options, (res) => {
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.be.an.array();
      expect(res.result[0].name).to.equal('foo');
      expect(res.result[0].name).to.not.equal('foo');
      done();
    });
  });

  lab.test('should error with invalid query', (done) => {
    const options = {
      url: url.format({
        pathname: '/events/',
        query: {
          kaboom: events[0].name,
        },
      }),
      method: 'GET',
      headers: { Authorization },
    };

    server.inject(options, (res) => {
      expect(res.statusCode).to.equal(400);
      done();
    });
  });
  lab.test('should return empty array if none found', (done) => {
    const options = {
      url: url.format({
        pathname: '/events/',
        query: {
          name: 'hardyharharharhar',
        },
      }),
      method: 'GET',
      headers: { Authorization },
    };

    server.inject(options, (res) => {
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.be.an.array();
      expect(res.result).to.be.empty();
      done();
    });
  });

  lab.test('should error with no auth', (done) => {
    const options = {
      url: url.format({
        pathname: '/events/',
        query: {
          name: events[0].name,
        },
      }),
      method: 'GET',
    };

    server.inject(options, (res) => {
      expect(res.statusCode).to.equal(401);
      done();
    });
  });
});
