echo "Database URL is $DATABASE_URL"
echo "NODE_ENV is $NODE_ENV"

if [[ $PORT  ]]
then
  export NODE_PORT=$PORT
  echo "Setting NODE_PORT=$PORT based on PORT"
fi

if [[ $NODE_ENV == "production" ]]
then
  npm run start
elif [[ $NODE_ENV == "development" ]]
then
  npm run up && npm run develop
else
  echo "Improper NODE_ENV=$NODE_ENV, stopping"
fi