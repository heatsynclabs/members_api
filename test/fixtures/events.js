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

const { Factory } = require('rosie');

const event = new Factory();

event
  .attr('id')
  .attr('name')
  // .attr('description')
  .attr('start_date')
  // .attr('end_date')
  .attr('frequency')
  .attr('location');

const fixture = [
  event.build({
    // id: '44fecd99-3400-449a-b13c-61ad7ffd1d11',
    name: 'Laser Class',
    // description: 'Join this class!\r\nIt\'s fun!',
    start_date: new Date('2019-10-11 13:00:00'),
    // end_date: '2019-10-11 15:00:00',
    frequency: 'weekly',
    location: 'HeatSync Labs',
    created_by: 'users:0',
  }),
];

module.exports = fixture;
