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

const env = process.env.NODE_ENV || 'development';
const port = process.env.NODE_PORT || process.env.PORT || 3004;
const { forEach, startsWith, lowerCase } = require('lodash');
const Pack = require('./package.json');
const knexFile = require('./knexfile');

const jwt = {
  password: process.env.JWT_KEY,
  signOptions: {},
};

const cookies = {
  password: process.env.JWT_PASSWORD || 'y7Nw7YMkgdJZww3RqtopYSpfnNqNfbMa',
  name: process.env.COOKIE_NAME || 'hsl3529673456',
  isSecure: !process.env.DEV_COOKIES,
  path: '/',
  isSameSite: process.env.DEV_SAME_SITE ? 'Lax' : 'None',
};

const oauth = {};
forEach(process.env, (v, k) => {
  if (startsWith(k, 'CLIENT_ID_') && v) {
    const brand = lowerCase(k.substring(10));
    if (!oauth[brand]) {
      oauth[brand] = { type: brand, options: {} };
    }
    oauth[brand].client_id = v;
  } else if (startsWith(k, 'CLIENT_SECRET_') && v) {
    const brand = lowerCase(k.substring(14));
    if (!oauth[brand]) {
      oauth[brand] = { type: brand, options: {} };
    }
    oauth[brand].client_secret = v;
  }
});

const connectionOptions = {
  test: {
    host: '0.0.0.0',
    port,
    routes: {
      // validate: {
      //   failAction: async (request, h, err) => {
      //     // in test, log and respond with the full error.
      //     console.error(err);
      //     throw err;
      //   }
      // },
      cors: {
        credentials: true,
        origin: ['*'],
      },
    },
  },

  development: {
    host: '0.0.0.0',
    port,
    routes: {
      // validate: {
      //   failAction: async (request, h, err) => {
      //     // in development, log and respond with the full error.
      //     console.error(err);
      //     throw err;
      //   }
      // },
      cors: {
        credentials: true,
        origin: ['*'],
      },
    },
  },
  production: {
    host: '0.0.0.0',
    port,
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
  siteName: process.env.SITE_NAME || 'HeatSync Labs',
  connection: connectionOptions[env],
  jwt,
  cookies,
  oauth,
  cache: cache[env],
  admin_email: process.env.ADMIN_EMAIL || 'info@heatsynclabs.org',
  domain: process.env.DOMAIN_LOCATION || 'http://localhost:3005',
  domain_dev: process.env.DOMAIN_LOCATION_DEV || 'http://localhost:3005',
  server_url: process.env.SERVER_URL || `http://localhost:${port}`,
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
  email: {
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY, // has priority over other means for email
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
    SMTP_SECURE: process.env.SMTP_SECURE || false,
    disable_sending: false,
  },
  server: {},
  version: Pack.version
};
