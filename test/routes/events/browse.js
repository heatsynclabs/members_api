const { expect } = require('code');
// eslint-disable-next-line
const lab = exports.lab = require('lab').script();
const url = require('url');
const sinon = require('sinon');

const bread = require('../../../lib/bread');
const server = require('../../../');
const { destroyRecords, getAuthToken, fixtures } = require('../../fixture-client');
const { users, events } = require('../../fixtures');
const { databaseError } = require('../../../lib/errors');

lab.experiment('GET /events/', () => {
  let event;
  let Authorization;

  lab.before(async () => {
    const data = await fixtures.create({ users, events });
    event = data.events[0];
    const authRes = await getAuthToken(data.users[0]);
    Authorization = authRes.token;
  });

  lab.after(() => {
    return destroyRecords({ events });
  });

  lab.test('should retrieve event information when logged in', (done) => {
      console.log('boo');
    const options = {
      url: url.format({
        pathname: '/events',
      }),
      method: 'GET',
      headers: { Authorization },
    };

      console.log('hi');
    server.inject(options, (res) => {
      console.log('res',res);
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.be.an.array();
      expect(res.result[0].name).to.equal('foo');
      expect(res.result[0].name).to.not.equal('foo');
      done();
    });
  });

  lab.test.skip('should error with invalid query', (done) => {
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

  lab.test('should error if database is not connected', (done) => {
    const stub = sinon.stub(bread, 'browse').callsFake(() => Promise.reject(databaseError()));

    const options = {
      url: url.format({
        pathname: '/events/',
        query: {
          name: events[0].name,
        },
      }),
      method: 'GET',
      headers: { Authorization },
    };

    server.inject(options, (res) => {
      expect(res.statusCode).to.equal(500);
      stub.restore();
      done();
    });
  });
});
