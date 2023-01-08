const { faker } = require('@faker-js/faker');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('events').del()
  const {id} = await knex('users').where('email', 'admin@example.com').first('id');

  let date1 = faker.date.soon;
  let date2 = date1;
  date2.setHours(date1.getHours()+1);
  let date3 = faker.date.soon;
  let date4 = date3;
  date4.setHours(date3.getHours()+1);
  await knex('events').insert([
    {name: "Laser Class", description: "Join this class!\r\nIt's fun!", start_date: date1, end_date: date2, frequency: "weekly", location: "HeatSync Labs", created_by: id},
    {name: "3D Printing Class", description: "Join this class!\r\nLiterally the most fun you will ever have.<br/>I <i>promise</i>.", start_date: date3, end_date: date4, frequency: "biweekly", location: "HeatSync Labs", created_by: id},
  ]);
};
