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

const breadRoutes = require('../lib/breadRoutes');
const userBreadRoutes = require('../lib/userBreadRoutes');
const model = require('../models/notice_comments');

const routes = breadRoutes({ model, scopes: { browse: ['USER'], default: ['ADMIN'] }, skip: ['read', 'add', 'edit', 'delete'] });
const userRoutes = userBreadRoutes({ model });

module.exports = routes.concat(userRoutes);
