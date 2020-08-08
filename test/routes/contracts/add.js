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
const sinon = require('sinon');
const url = require('url');
const { omit } = require('lodash');

const bread = require('../../../lib/bread');
const server = require('../../../');
const { destroyRecords, getAuthToken, fixtures } = require('../../fixture-client');
const { users, contracts } = require('../../fixtures');
const { databaseError } = require('../../../lib/errors');

lab.experiment('POST /contracts', () => {
  let user;
  let Authorization;
  lab.before(async () => {
    const data = await fixtures.create({ users });
    user = data.users[0];
    const authRes = await getAuthToken(data.users[0]);
    Authorization = authRes.token;
  });

  lab.after(() => {
    return destroyRecords({ contracts, users })
  });

  lab.test('should create a contract', async () => {
    const contract = {
      first_name: 'Foobar',
      signed_at: new Date('2019-11-11 13:00:00'),
    }
    const options = {
      url: url.format('/contracts'),
      method: 'POST',
      payload: contract,
      headers: { Authorization },
    };

    const res = await server.inject(options);
    if(res.result && res.result.id) { // sometimes we don't get a result (i.e. 500)
      tokens.push(res.result.id);
    }
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.be.an.object();
    expect(res.result).to.include('id');
  });
});
