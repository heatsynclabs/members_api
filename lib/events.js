const debug = require('debug')('events');
const bread = require('./bread');

const { allEvents } = require('./queries');

const eventFields = [
  'id',
  'name',
  'description',
  'start_date',
  'end_date',
  'frequency',
  'location',
  'created_at',
  'updated_at'
];

function browse(query) {
  return bread.browse('events', eventFields, {});
}

module.exports = {
  browse
};
