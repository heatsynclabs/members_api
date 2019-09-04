const debug = require('debug')('error');

const {
  uniqueViolation,
  notFound,
  databaseError,
  unauthorized,
  badData,
  unverified
} = require('./error_types');

module.exports = {
  throwDatabaseError(error) {
    debug('/lib/errors throwDatabaseError =>', error);
    if (error.code === '23505') {
      return Promise.reject(uniqueViolation());
    }
    if (error.code === '20000') {
      return Promise.reject(notFound());
    }
    return Promise.reject(databaseError());
  },
  throwNotFound() {
    return Promise.reject(notFound());
  },
  throwBadData() {
    return Promise.reject(badData());
  },
  throwAuthError() {
    return Promise.reject(unauthorized());
  },
  throwUnverified() {
    return Promise.reject(unverified());
  }
};
