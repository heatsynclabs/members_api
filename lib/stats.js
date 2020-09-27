// Copyright 2019 Iced Development, LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const bread = require('./bread');
const { stats } = require('./queries');
const cache = require('./cache');

const STATS_TTL = 1000 * 60 * 10; // ten minutes

async function general() {
  const generalStats = await bread.raw(stats, {});
  return generalStats[0];
}

async function generalCached() {
  const generalStats = await cache.getOrStore({ segment: 'STATS', id: 'GENERAL' }, STATS_TTL, general);
  return generalStats;
}

function clearCache() {
  return cache.drop({ segment: 'STATS', id: 'GENERAL' });
}

module.exports = {
  generalCached,
  clearCache
};
