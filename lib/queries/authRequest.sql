-- Copyright 2019 Iced Development, LLC
--
-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
--
--     http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.

SELECT
  u.id,
  u.password,
  u.email,
  u.is_validated,
  u.is_deleted,
  u.version,
  u.name,
  COALESCE(
    (
      SELECT json_agg(memberships.group_id)
      FROM memberships
      WHERE user_id = u.id
    ), '[]'::json
  ) AS scope
FROM
  users AS u
WHERE
  u.email = ?
