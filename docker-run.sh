# Copyright 2019 Iced Development, LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

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

if [[ $NPMINSTALL == 1  ]]
then
  echo "Running npm install since NPMINSTALL=$NPMINSTALL"
  npm install
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