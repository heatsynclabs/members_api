const env = process.env.NODE_ENV || 'development';
const port = process.env.NODE_PORT || port;
const Pack = require('./package');
const knexFile = require('./knexfile');

const jwt = {
  password: process.env.JWT_KEY,
  signOptions: {},
};

const connectionOptions = {
  test: {
    host: '0.0.0.0',
    port: port,
    routes: {
      cors: {
        credentials: true,
        origin: ['*'],
      },
    },
  },

  development: {
    host: '0.0.0.0',
    port: port,
    routes: {
      cors: {
        credentials: true,
        origin: ['*'],
      },
    },
  },
  production: {
    host: '0.0.0.0',
    port: port,
    routes: {
      cors: {
        credentials: true,
        origin: ['*'],
      },
    },

  },
};

const cache = {
  test: {
    type: 'memory',
    options: {},
  },
  development: {
    type: 'memory',
    options: {},
  },
  production: {
    type: 'redis',
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
    },
  },
};

module.exports = {
  env,
  knex: knexFile,
  connection: connectionOptions[env],
  jwt: jwt,
  cache: cache[env],
  admin_email: process.env.ADMIN_EMAIL || 'admin@iceddev.com',
  domain: process.env.DOMAIN_LOCATION || 'http://localhost:3005',
  swaggerOptions: {
    info: {
      title: Pack.name,
      description: Pack.description + ' - ' + env,
      version: Pack.version,
    },
    securityDefinitions: {
      jwt: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
    tags: [{
      name: 'api',
      description: 'HSL API',
      externalDocs: {
        description: 'find out more',
        url: 'https://heatsynclabs.org',
      },
    }],
    pathPrefixSize: 3,
  },
  sendgrid: {
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  },
  server: {},
  version: Pack.version
};
