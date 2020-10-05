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
const { postalCounts } = require('./queries');
const { trim } = require('lodash');

async function getCounts() {
  const rows = await bread.raw(postalCounts, {});
  // TODO - handler international?
  return rows.filter(row => trim(row.postal_code).length > 4 && !isNaN(Number(row.postal_code)));
}

module.exports = {
  getCounts,
};
