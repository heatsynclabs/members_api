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
