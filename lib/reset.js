const bcrypt = require('bcrypt');

const knex = require('../knex');
const Email = require('./email');
const bread = require('./bread');

const { clearCache } = require('./users');
const { validationRequest } = require('./queries');

module.exports = {
  async resetRequest(email) {
    const userData = await bread.read('users', ['id'], { email });

    const emailClient = new Email();

    const query = await knex('time_token')
      .returning(['id'])
      .insert({
        user_id: userData.id,
        token_type: 'RESET',
      });
    await emailClient.sendReset(email, query[0].id);
    return 'ok';
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
    return 'ok';
  }
};
