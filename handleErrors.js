const boom = require('boom');
const debug = require('debug')('errors');
const errors = require('./lib/error_types');

module.exports = function handleErrors(request, h) {
  let customError;
  if (request.response instanceof Error) {
    switch (request.response.name) {
      case errors.notFound().name:
        debug('handleErrors => notFound()');
        return boom.notFound();
      case errors.databaseError().name:
        debug('handleErrors => databaseError()');
        return boom.badImplementation();
      case errors.uniqueViolation().name:
        debug('handleErrors => uniqueViolation()');
        return boom.badData();
      case errors.badData().name:
        debug('handleErrors => badData()');
        return boom.badData();
      case errors.badRequest().name:
        debug('handleErrors => badRequest()');
        return boom.badRequest();
      case errors.unauthorized().name:
        debug('handleErrors => unauthorized()');
        return boom.unauthorized();
      case errors.unverified().name:
        debug('handleErrors => unverified()');
        customError = boom.unauthorized();
        customError.output.payload.error = 'Unverified';
        return customError;
      case errors.forbidden().name:
        debug('handleErrors => forbidden()');
        return boom.forbidden();
      default:
        if (request.response.code === '23505') {
          return boom.badData();
        }
        if (request.response.code === '20000') {
          return  boom.notFound();
        }
        return h.continue;
    }
  }
  return h.continue;
};
