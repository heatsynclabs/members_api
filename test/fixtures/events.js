const faker = require('faker');
const { Factory } = require('rosie');

const event = new Factory();

event
  // .attr('id')
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
  }),
];

module.exports = fixture;
