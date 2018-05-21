const bread = require('./bread');
const { stats } = require('./queries');
const cache = require('./cache');

const STATS_TTL = 1000 * 60 * 10; //ten minutes

async function general() {
  const generalStats = await bread.raw(stats, {});
  console.log('generalStats', generalStats);
  return generalStats[0];
}

async function generalCached() {
  const generalStats = await cache.getOrStore({ segment: 'STATS', id: 'GENERAL' }, STATS_TTL, general);
  console.log('generalStats', generalStats);
  return generalStats;
}

function clearCache() {
  return cache.drop({ segment: 'STATS', id: 'GENERAL' });
}

module.exports = {
  generalCached,
  clearCache
};
