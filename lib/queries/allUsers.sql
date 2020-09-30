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

select
  u.id,
  u.name,
  u.email,
  md5(lower(email)) gravatar,
  u.email_visible,
  u.phone,
  u.waiver,
  u.orientation,
  u.facebook_url,
  u.github_url,
  u.twitter_url,
  u.website_url,
  u.created_at,
  u.postal_code,
  u.member_level,
  COALESCE(
    (
      SELECT json_agg(certs.name)
      FROM certifications certs, user_certifications ucerts
      WHERE ucerts.user_id = u.id
      AND certs.id = ucerts.cert_id
    ), '[]'::json
  ) AS user_certs
  FROM
    users AS u
  WHERE
    u.deleted_at IS NULL
