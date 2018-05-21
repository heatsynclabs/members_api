const Pack = require('../package');

function health() {
  return { version: Pack.version };
}

module.exports = health;
