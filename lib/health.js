const config = require('../config');
const bread = require('./bread');

async function health() {
  try{
    const [ migration ] = await bread.raw(`select * from knex_migrations order by name DESC LIMIT 1;`);

    return {
      status: 'Healthy',
      version: config.version,
      uptime: Math.round(process.uptime() / 60) + ' Minutes',
      migration,
      env: config.env
    };
  }catch(error) {
    console.log('health error', error);
    throw error;
  }
}

module.exports = health;
