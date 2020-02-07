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

const {
  compact,
  get,
  uniq,
  without
} = require('lodash');

const errors = require('./lib/errors');


// TODO: We might be able to move this to Hapi scope functions on a per route basis!
// This only gets called after a scope has matched a route scope
module.exports = function handleRoles(request, h) {
  const routeScope = get(request, 'route.settings.auth.access[0].scope.selection', []);
  const userScope = get(request, 'auth.credentials.scope', []);
  // console.log('\n\nhandleRoles', request.path, request.params, 'routeScope', routeScope, 'userScope', userScope);

  // If user has credentials AND route requires credentials
  if (request.auth.credentials && (routeScope.length > 0)) {
    // If ADMIN is allowed on a route, and user is one, they can access it.
    if (routeScope.includes('ADMIN') && userScope.includes('ADMIN')) {
      return h.continue;
    }

    // If user is allowed on a route, and user matches, they can access it.
    if (routeScope.includes('USER') && userScope.includes('USER')) {
      const loginId = request.auth.credentials.id;
      const userIds = uniq(compact([
        get(request, 'params.user_id'),
        get(request, 'query.user_id'),
        get(request, 'payload.user_id'),
      ]));

      // If no id other than our own, continue
      if (without(userIds, loginId).length < 1) {
        return h.continue;
      }
    }

    // No scopes match(shouldn't be possible),
    // Or all scope checks failed
    return errors.throwForbidden();
  }

  // Route has no auth
  return h.continue;
};
