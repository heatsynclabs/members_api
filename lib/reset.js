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

const bcrypt = require('bcrypt');
const debug = require('debug')('errors');
const knex = require('../knex');
const { sendReset } = require('./email');
const bread = require('./bread');

const { clearCache } = require('./users');
const { validationRequest } = require('./queries');

module.exports = {
  async resetRequest(email) {
    const userData = await bread.read('users', ['id'], { email });


    const query = await knex('time_token')
      .returning(['id'])
      .insert({
        user_id: userData.id,
        token_type: 'RESET',
      });

    try {
      await sendReset(email, query[0].id);
    } catch (err) {
      debug('Sendgrid email sending error: ', err);
      return err;
    }
    return { value: 'ok' };
  },
  async resetPassword(token, newPassword) {
    const [res] = await bread.raw(validationRequest, [token]);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await knex.transaction((t) => {
      return t('users')
        .where({
          id: res.user_id,
        })
        .update({
          password: hashedPassword,
          version: res.version + 1,
          is_validated: true,
        })
        .tap(() => {
          return t('time_token')
            .where({ id: token })
            .update({
              used_at: new Date(),
            });
        });
    });
    await clearCache(res.user_id);
    return { value: 'ok' };
  }
};
