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

const userBreadRoutes = require('../lib/userBreadRoutes');
const breadRoutes = require('../lib/breadRoutes');
const model = require('../models/user_certifications');
const { getCreds, isAdmin } = require('../lib/util');
const instructorModel = require('../models/instructors');

const instructorOrAdmin = async (req) => {
  const cert_id = req.params.id || req.payload.cert_id;
  if (isAdmin(req)) {
    return true;
  }

  const creds = getCreds(req);
  const instructors = await instructorModel.browse({ user_id: creds.id, cert_id });
  return !!instructors.length;
};

const userRoutes = userBreadRoutes({
  model,
  canAdd: instructorOrAdmin,
  canEdit: instructorOrAdmin,
  canDelete: instructorOrAdmin,
});

const routes = breadRoutes({ model, scopes: { browse: ['USER'], default: ['ADMIN'] }, skip: ['read', 'add', 'edit', 'delete'] });
module.exports = routes.concat(userRoutes);
