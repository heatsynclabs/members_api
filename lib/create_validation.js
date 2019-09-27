const knex = require('../knex');

const { sendValidation } = require('./email');

async function createValidation(data) {
  const tt = await knex('time_token')
    .returning(['id', 'user_id', 'token_type'])
    .insert({
      user_id: data.id,
      token_type: 'VALIDATION',
    });

  try {
    const out = await sendValidation(data.email, tt[0].id);
    console.log('Sendgrid email sent: ',data.email, out);
  } catch (err) {
    console.log('Sendgrid email sending error: ',err);
    throw err;
  }

  return tt[0];
}

module.exports = createValidation;
