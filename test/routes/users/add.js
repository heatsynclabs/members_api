const { expect } = require('code');
// eslint-disable-next-line
const lab = exports.lab = require('lab').script();
const sinon = require('sinon');
const url = require('url');
const { omit } = require('lodash');

const bread = require('../../../lib/bread');
const server = require('../../../');
const { destroyRecords, destroyTokens, fixtures } = require('../../fixture-client');
const { users } = require('../../fixtures');
const { databaseError } = require('../../../lib/errors');

lab.experiment('POST /user', () => {
  // eslint-disable-next-line
  let tokens = [];

  lab.before((done) => {
    fixtures.create({ users })
      .then((res) => {
        console.log("res ", res);
        done();
      })
      .catch(done);
  });

  lab.after(() => {
    return destroyRecords({ users })
      .then(destroyTokens(tokens));
  });

  lab.test('should create a user', async () => {
    const user = omit(users[0], ['id', 'is_validated', 'is_deleted']);
    const options = {
      url: url.format('/users'),
      method: 'POST',
      payload: user,
    };

    const res = await server.inject(options);
    if(res.result && res.result.id) { // sometimes we don't get a result (i.e. 500)
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
      console.log('res', res, res.statusCode);
      expect(res.statusCode).to.equal(500);
      stub.restore();
      done();
    });
  });
});
