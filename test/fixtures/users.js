const faker = require('faker');
const { Factory } = require('rosie');

const user = new Factory();

user
  // .attr('id')
  .attr('password', '$2a$10$.KyBD1VevOUePkvAE/qDjufhc7dmvjrLsTsCa/As/PDBG.Hmh.ZCq')
  .attr('email', faker.internet.email)
  .attr('is_validated')
  .attr('is_deleted');

const fixture = [
  user.build({
    // id: '44fecd99-3400-449a-b13c-61ad7ffd1d71',
    is_validated: true,
    is_deleted: false,
  }),
  user.build({
    // id: '44fecd99-3400-449a-b13c-61ad7ffd1d72',
    is_validated: true,
    is_deleted: true,
  }),
  user.build({
    // id: '44fecd99-3400-449a-b13c-61ad7ffd1d73',
    is_validated: false,
    is_deleted: false,
  }),
  user.build({
    // id: '44fecd99-3400-449a-b13c-61ad7ffd1d74',
    is_validated: false,
    is_deleted: true,
  }),
];

module.exports = fixture;
