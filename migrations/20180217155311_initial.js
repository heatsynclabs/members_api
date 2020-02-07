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

const fs = require('fs');
const knex = require('../knex')

const up = fs.readFileSync('./migrations/up/20180217155311_initial.sql', 'utf8');
const down = fs.readFileSync('./migrations/down/20180217155311_initial.sql', 'utf8');


exports.up = async function(knexing, success) {
  try {
    await knex.raw(up)
  } catch (err) {
    console.log('err', err);
    return err;
  }
};

exports.down = async function(success, error) {
  try {
    await knex.raw(down)
  } catch (err) {
    console.log('err', err);
    return err;
  }
};
