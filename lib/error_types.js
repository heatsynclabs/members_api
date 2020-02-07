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

const customError = require('custom-error');

module.exports = {
  uniqueViolation: customError('Unique record violation'),
  badRequest: customError('Bad Request'),
  badData: customError('Bad Data'),
  notFound: customError('Not Found'),
  databaseError: customError('Database Error'),
  unauthorized: customError('Authentication Failed'),
  unverified: customError('Unverified Account'),
  forbidden: customError('Insufficient role permissions')
};
