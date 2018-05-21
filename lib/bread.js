const config = require('../config');
const bread = require('breadfruit')(config.knex);

module.exports = bread;
