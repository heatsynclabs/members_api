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

FROM node:16-alpine AS dev

EXPOSE 3004 9229

RUN apk update

WORKDIR /home/app

COPY package.json /home/app/
COPY package-lock.json /home/app/
COPY docker-run.sh /home/app/

RUN npm ci

CMD /home/app/docker-run.sh
