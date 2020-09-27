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

const knex = require('../knex');
const debug = require('debug')('errors');
const { sendValidation } = require('./email');

async function createValidation(data) {
  const tt = await knex('time_token')
    .returning(['id', 'user_id', 'token_type'])
    .insert({
      user_id: data.id,
      token_type: 'VALIDATION',
    });

  try {
    await sendValidation(data.email, tt[0].id);
  } catch (err) {
    debug('Sendgrid email sending error: ', err);
    throw err;
  }

  return tt[0];
}

module.exports = createValidation;
