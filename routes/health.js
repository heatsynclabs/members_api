const health = require('../lib/health');

module.exports = [
  {
    method: 'GET',
    path: '/health',
    config: {
      auth: false,
      handler: health,
      description: 'Health Check',
      notes: 'Reports back health of systems being utilized',
      tags: ['api'],
    },
  }
];
