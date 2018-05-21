const health = require('./health');
const users = require('./users');
const auth = require('./auth');
const certs = require('./certs');
const cards = require('./cards');
const stats = require('./stats');


// Routes - Exports a default for routes to be used in index.js
module.exports = [].concat(
  auth,
  health,
  users,
  certs,
  cards,
  stats
);
