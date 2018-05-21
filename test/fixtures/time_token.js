const faker = require('faker');
const { Factory } = require('rosie');
const uuidV4 = require('uuid/v4');

const time_token = new Factory();

time_token
  .attr('id', uuidV4)
  .attr('user_id', faker.internet.userName)
  .attr('token_type')
  .attr('created_at')
  .attr('used_at');

const fixture = [
  time_token.build({
    token_type: 'RESET',
  }),
  time_token.build({
    token_type: 'RESET',
  }),
  time_token.build({
    token_type: 'VALIDATION',
  }),
  time_token.build({
    token_type: 'VALIDATION',
  }),
];

module.exports = fixture;
