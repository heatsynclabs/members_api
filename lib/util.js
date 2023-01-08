const { pick, get, includes } = require('lodash');

function getCreds(req) {
  const creds = get(req, 'auth.credentials');
  if (Array.isArray(creds)) {
    return pick(creds[0], ['email', 'scope', 'id', 'name']);
  }
  return pick(creds, ['email', 'scope', 'id', 'name']);
}

function isAdmin(req) {
  const creds = getCreds(req);
  return creds && includes(creds.scope, 'ADMIN');
}

const userOrAdmin = async (req) => {
  const creds = getCreds(req);
  if (req.params.user_id === creds.id) {
    return true;
  } if (isAdmin(req)) {
    return true;
  }
  return false;
};

module.exports = {
  getCreds,
  isAdmin,
  userOrAdmin,
};
