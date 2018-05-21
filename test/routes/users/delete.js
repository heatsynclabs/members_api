const { expect } = require('code');
// eslint-disable-next-line
const lab = exports.lab = require('lab').script();
const url = require('url');

const server = require('../../../');
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
