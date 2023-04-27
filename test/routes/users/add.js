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
const sinon = require('sinon');
const url = require('url');
const { omit } = require('lodash');

const bread = require('../../../lib/bread');
const server = require('../../..');
const { users } = require('../../fixtures');
const clearDb = require('../../clearDb');

lab.experiment('POST /user', () => {
  // eslint-disable-next-line
  let tokens = [];

  lab.after(async () => {
    await clearDb();
  });

  lab.test('should create a user', async () => {
    const user = omit(users[0], ['id', 'is_validated', 'is_deleted']);
    const options = {
      url: url.format('/users'),
      method: 'POST',
      payload: user,
    };

    const res = await server.inject(options);
    if (res.result && res.result.id) { // sometimes we don't get a result (i.e. 500)
      tokens.push(res.result.id);
    }
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.be.an.object();
    expect(res.result).to.include('id');
  });

  lab.test('should error with missing fields', async () => {
    const user = omit(users[1], ['id', 'password', 'is_validated', 'is_deleted']);
    const options = {
      url: url.format('/users'),
      method: 'POST',
      payload: user,
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(400);
  });

  lab.test('should error with duplicate email', (done) => {
    const user = omit(users[0], ['id', 'is_validated', 'is_deleted']);
    const options = {
      url: url.format('/users'),
      method: 'POST',
      payload: user,
    };

    server.inject(options, (res) => {
      expect(res.statusCode).to.equal(422);
      expect(res.result).to.be.an.object();
      done();
    });
  });

  lab.test('should return an error if unable to connect to the database', (done) => {
    const stub = sinon.stub(bread, 'add').callsFake(() => Promise.reject(new Error('database')));
    const user = omit(users[0], ['id', 'is_validated', 'is_deleted']);
    const options = {
      url: url.format('/users'),
      method: 'POST',
      payload: user,
    };

    server.inject(options, (res) => {
      expect(res.statusCode).to.equal(500);
      stub.restore();
      done();
    });
  });
});
