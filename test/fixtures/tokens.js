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

const faker = require('faker');
const { Factory } = require('rosie');

const tokens = new Factory();

tokens
  .attr('id')
  .attr('username', faker.internet.userName)
  .attr('password', '$2a$10$.KyBD1VevOUePkvAE/qDjufhc7dmvjrLsTsCa/As/PDBG.Hmh.ZCq')
  .attr('email', faker.internet.email)
  .attr('is_validated')
  .attr('is_deleted');

const fixture = [
  tokens.build({
    id: 3137,
    is_validated: true,
    is_deleted: false,
  }),
];

module.exports = fixture;
