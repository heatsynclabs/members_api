const Hapi = require('hapi');
const Vision = require('vision');
const Inert = require('inert');
const JWTAuth = require('hapi-auth-jwt2');
const HapiSwagger = require('hapi-swagger');
const debug = require('debug')('errors');
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

// Don't worry be hapi
start();

module.exports = server;
