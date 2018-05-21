const knex = require('../knex');

const { sendValidation } = require('./email');

async function createValidation(data) {
  const tt = await knex('time_token')
    .returning(['id', 'user_id', 'token_type'])
    .insert({
      user_id: data.id,
      token_type: 'VALIDATION',
    });
  await sendValidation(data.email, tt[0].id);
  return tt[0];
}

module.exports = createValidation;
