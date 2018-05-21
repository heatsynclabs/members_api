const fs = require('fs');
const path = require('path');

function getContent(name) {
  return fs.readFileSync(path.join(__dirname, `./${name}.sql`), 'utf8');
}

module.exports = {
  validationRequest: getContent('validationRequest'),
  authRequest: getContent('authRequest'),
  allUsers: getContent('allUsers'),
  allCards: getContent('allCards'),
  newUsers: getContent('newUsers'),
  stats: getContent('stats')
};
