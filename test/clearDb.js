const { SchemaInspector } = require('knex-schema-inspector');
const Debug = require('debug');
const knex = require('../knex');

const debug = Debug('clearDb');

const inspector = SchemaInspector(knex);

async function resetDb() {
  debug('Removing all db records');

  const tableNames = await inspector.tables();

  while (tableNames.length) {
    const tableName = tableNames.shift();
    try {
      debug('Removing db records from table %s', tableName);
      await knex(tableName).del();
    } catch (error) {
      debug('Failed to remove db records from table %s; re-queueing', tableName);
      tableNames.push(tableName);
    }
  }
}

module.exports = resetDb;
