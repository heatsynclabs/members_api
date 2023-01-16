echo "Database URL is $DATABASE_URL"
echo "NODE_ENV is $NODE_ENV"

echo "Setting PATH from $PATH ..."
export PATH=$PATH:$(pwd)/node_modules/.bin
echo "... to $PATH"

if [[ $PORT  ]]
then
  export NODE_PORT=$PORT
  echo "Setting NODE_PORT=$PORT based on PORT"
fi

if [[ $NPMINSTALL == 1 ]]
then
  npm install
fi

if [[ $NODE_ENV == "production" ]]
then
  npm run start
elif [[ $NODE_ENV == "development" ]]
then
  npm run db_migrate_latest
  npm run develop
elif [[ $NODE_ENV == "test" ]]
then
  npm run db_migrate_rollback_all
  npm run db_migrate_latest
  npm run test
fi
