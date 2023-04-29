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

const boom = require('@hapi/boom');
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
          return boom.notFound();
        }
        return h.continue;
    }
  }
  return h.continue;
};
