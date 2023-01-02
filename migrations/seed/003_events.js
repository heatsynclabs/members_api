/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('events').del()
  const {id} = await knex('users').where('email', 'admin@example.com').first('id');
  await knex('events').insert([
    {name: "Laser Class", description: "Join this class!\r\nIt's fun!", start_date: "2019-10-11 13:00:00", end_date: "2019-10-11 15:00:00", frequency: "weekly", location: "HeatSync Labs", created_by: id},
  ]);
};
