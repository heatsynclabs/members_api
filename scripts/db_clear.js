const clearDb = require('../test/clearDb');

clearDb().then(() => {
  process.exit(0);
});
