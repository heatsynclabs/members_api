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
  (select count(*) from users where deleted_at IS NULL) as user_count,
  (select count(*) from users where deleted_at IS NULL AND created_at > NOW() - interval '14 days') as new_user_count,
  (select count(*) from user_certifications) as user_certs,
  (select count(*) from user_certifications where created_at > NOW() - interval '14 days') as new_cert_count
