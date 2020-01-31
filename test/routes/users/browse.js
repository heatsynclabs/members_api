const { expect } = require('code');
// eslint-disable-next-line
const lab = exports.lab = require('lab').script();
const url = require('url');

const server = require('../../../');
const { destroyRecords, getAuthToken, fixtures } = require('../../fixture-client');
const { users } = require('../../fixtures');

lab.experiment('GET /users/', () => {
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

  lab.test('should retrieve my information when logged in', (done) => {
    const options = {
      url: url.format({
        pathname: '/users/',
        query: {
          email: users[0].email,
        },
      }),
      method: 'GET',
      headers: { Authorization },
    };

    server.inject(options, (res) => {
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.be.an.array();
      expect(res.result[0].email).to.equal(user.email);
      done();
    });
  });

  lab.test.skip('should error with invalid query', (done) => {
    const options = {
      url: url.format({
        pathname: '/users/',
        query: {
          kaboom: users[0].email,
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
        pathname: '/users/',
        query: {
          email: 'hardyharharharhar',
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
        pathname: '/users/',
        query: {
          email: users[0].email,
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
