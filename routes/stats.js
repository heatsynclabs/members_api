const { generalCached } = require('../lib/stats');

module.exports = [
  {
    method: 'GET',
    path: '/stats',
    config: {
      auth: {
        strategy: 'jwt',
        scope: ['USER'],
      },
      handler: generalCached,
      description: 'list stats',
      tags: ['api', 'stats'], // ADD THIS TAG
    },
  }
];
