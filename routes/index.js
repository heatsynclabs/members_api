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

const health = require('./health');
const users = require('./users');
const auth = require('./auth');
const certs = require('./certs');
const cards = require('./cards');
const stats = require('./stats');
const events = require('./events');
const memberships = require('./memberships');
const instructors = require('./instructors');
const userCerts = require('./user_certs');
const notices = require('./notices');
const noticeComments = require('./notice_comments');
const allUsers = require('./all_users');
const postalCodes = require('./postal_codes');

// Routes - Exports a default for routes to be used in index.js
module.exports = [].concat(
  auth,
  health,
  users,
  certs,
  cards,
  stats,
  events,
  memberships,
  instructors,
  userCerts,
  notices,
  noticeComments,
  allUsers,
  postalCodes,
);
