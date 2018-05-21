const { expect } = require('code');
// eslint-disable-next-line
const lab = exports.lab = require('lab').script();
const url = require('url');

const server = require('../../../');
const { destroyRecords, getAuthToken, fixtures } = require('../../fixture-client');
const { users } = require('../../fixtures');

lab.experiment('GET /user/me', () => {
  let user;
  let Authorization;

  lab.before(async () => {
    const data = await fixtures.create({ users });
    user = data.users[0];
    const authRes = await getAuthToken(data.users[0]);
    Authorization = authRes.token;
  });

  lab.after(() => {
    return destroyRecords({ users });
  });

  lab.test('should retrieve my information when logged in', async () => {
    const options = {
      url: url.format({ pathname: '/users/me' }),
      method: 'GET',
      headers: { Authorization },
    };

    const res = await server.inject(options);
    expect(res.statusCode).to.equal(200);
    expect(res.result.id).to.equal(user.id);
    expect(res.result.email).to.equal(user.email);
  });

  lab.test('Give unauthorized error when not passing valid credentials', (done) => {
    const options = {
      url: url.format({ pathname: '/users/me' }),
      method: 'GET',
    };

    server.inject(options, (res) => {
      expect(res.statusCode).to.equal(401);
      done();
    });
  });
});
