/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  await knex('users').insert([
    {password: bcrypt.hashSync('Testing1!!', 10), email: "admin@example.com", name: "Admin", is_validated: true, member_level: 100},
    {password: bcrypt.hashSync('Testing1!!', 10), email: "gobie@example.com", name: "Gobie McDaniels", is_validated: true, member_level: 5},
    {password: bcrypt.hashSync('Testing1!!', 10), email: "jimbo@example.com", name: "Jimbo Fargo", is_validated: false, member_level: 1},
    {password: bcrypt.hashSync('Testing1!!', 10), email: "hardy@example.com", name: "Hardy Bridle", is_validated: true, member_level: 10},
  ]);
};
