/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('memberships').del();
  const {id} = await knex('users').where('email', 'admin@example.com').first('id');
  await knex('memberships').insert([{user_id: id, group_id: 'ADMIN'}]);
};
