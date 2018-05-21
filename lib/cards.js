const debug = require('debug')('cards');
const bread = require('./bread');

const { allCards } = require('./queries');

function all() {
  return bread.raw(allCards, {});
}

module.exports = {
  all
};
