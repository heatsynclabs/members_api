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

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const JWTAuth = require('hapi-auth-jwt2');
const HapiSwagger = require('hapi-swagger');
const CookieAuth = require('@hapi/cookie');
const debug = require('debug')('errors');
const { mqtt } = require('./lib/mqtt');
const ws = require('websocket-stream');
const config = require('./config');
const { validateJWT } = require('./lib/users');
const handleRoles = require('./handleRoles');
const handleErrors = require('./handleErrors');

// Pull in routes config
const Routes = require('./routes');

// Declare a new instance of hapi
const server = Hapi.server(config.connection);

// Start server function
async function start() {
  // register hapi-now-auth plugin
  try {
    await server.register([
      CookieAuth,
      JWTAuth,
      Inert,
      Vision,
      {
        plugin: HapiSwagger,
        // eslint-disable-next-line
        options: config.swaggerOptions
      },
    ]);
  } catch (error) {
    debug(error);
    process.exit(1);
  }

  server.auth.strategy('auth', 'cookie', {
    cookie: config.cookies,
    validateFunc: async () => {
      return { valid: true };
    }
  });
  server.auth.strategy('jwt', 'jwt', {
    verifyOptions: { algorithms: ['HS256'] },
    key: config.jwt.password,
    validate: validateJWT
  });

  server.route(Routes);

  // Handle role permissions
  server.ext('onPreHandler', handleRoles);

  // Automatically turn custom error types into http error responses
  server.ext('onPreResponse', handleErrors);


  try {
    await server.start();
  } catch (err) {
    debug(err);
    return err;
  }
}

ws.createServer({ server: server.listener }, mqtt.handle);

// Don't worry be hapi
start();

console.log(`http server documentation at http://localhost:${config.connection.port}/documentation`);

module.exports = server;
