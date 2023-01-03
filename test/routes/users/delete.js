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

lab.experiment('DELETE /users/', () => {
  let user;
  let user2;
  let Authorization;

  lab.before(async () => {
    const data = await fixtures.create({ users });
    user = data.users[0];
    user2 = data.users[1];
    const authRes = await getAuthToken(data.users[0]);
    Authorization = authRes.token;
  });

  lab.after(() => {
    return destroyRecords({ users });
  });

  lab.test('should fail if trying to delete an unauthorized user', async () => {
    const options = {
      url: url.format(`/users/${user2.id}`),
      method: 'DELETE',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(403);
  });

  lab.test('should successfully delete a user', async () => {
    const options = {
      url: url.format(`/users/${user.id}`),
      method: 'DELETE',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(res.result.id).to.equal(user.id);
    expect(res.result.is_deleted).to.equal(true);
  });
});
