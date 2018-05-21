const customError = require('custom-error');

module.exports = {
  uniqueViolation: customError('Unique record violation'),
  badRequest: customError('Bad Request'),
  badData: customError('Bad Data'),
  notFound: customError('Not Found'),
  databaseError: customError('Database Error'),
  unauthorized: customError('Authentication Failed'),
  unverified: customError('Unverified Account'),
  forbidden: customError('Insufficient role permissions')
};
