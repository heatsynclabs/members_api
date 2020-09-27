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

DROP VIEW instructors_v;
DROP VIEW memberships_v;
DROP VIEW user_certifications_v;
DROP VIEW user_cards_v;
DROP VIEW user_groups_v;
DROP TABLE instructors CASCADE;
DROP TABLE users CASCADE;
DROP TABLE payment_methods CASCADE;
DROP TABLE time_token CASCADE;
DROP TABLE EVENTS CASCADE;
DROP TABLE groups CASCADE;
DROP TABLE memberships CASCADE;
DROP TABLE cards CASCADE;
DROP TABLE contracts CASCADE;
DROP TABLE user_certifications CASCADE;
DROP TABLE payments CASCADE;
DROP TABLE certifications CASCADE;
DROP TYPE token_type CASCADE;
DROP EXTENSION "citext" CASCADE;
DROP EXTENSION "uuid-ossp" CASCADE;
DROP FUNCTION updated_at() CASCADE;
