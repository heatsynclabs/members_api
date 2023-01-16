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

const { faker } = require('@faker-js/faker');
const { Factory } = require('rosie');

const user = new Factory();

user
  // .attr('id')
  .attr('name')
  .attr('password', '$2a$10$.KyBD1VevOUePkvAE/qDjufhc7dmvjrLsTsCa/As/PDBG.Hmh.ZCq')
  .attr('email', faker.internet.email)
  .attr('is_validated')
  .attr('is_deleted');

const fixture = [
  // user 1 will be an admin
  user.build({
    // id: '44fecd99-3400-449a-b13c-61ad7ffd1d71',
    is_validated: true,
    is_deleted: false,
  }),
  // user 2+ won't be
  user.build({
    // id: '44fecd99-3400-449a-b13c-61ad7ffd1d72',
    is_validated: true,
    is_deleted: false,
  }),
  user.build({
    // id: '44fecd99-3400-449a-b13c-61ad7ffd1d73',
    is_validated: false,
    is_deleted: true,
  }),
];

module.exports = fixture;
