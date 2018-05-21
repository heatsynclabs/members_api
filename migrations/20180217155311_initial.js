const fs = require('fs');
const knex = require('../knex')

const up = fs.readFileSync('./migrations/up/20180217155311_initial.sql', 'utf8');
const down = fs.readFileSync('./migrations/down/20180217155311_initial.sql', 'utf8');


exports.up = async function(knexing, success) {
  try {
    await knex.raw(up)
  } catch (err) {
    console.log('err', err);
    return err;
  }
};

exports.down = async function(success, error) {
  try {
    await knex.raw(down)
  } catch (err) {
    console.log('err', err);
    return err;
  }
};
