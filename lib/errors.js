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

const debug = require('debug')('error');

const {
  uniqueViolation,
  notFound,
  databaseError,
  unauthorized,
  badData,
  unverified,
  forbidden
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
  },
  throwForbidden() {
    return Promise.reject(forbidden());
  }
};
