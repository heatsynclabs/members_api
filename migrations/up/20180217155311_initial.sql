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

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TYPE token_type AS ENUM (
  'RESET',
  'VALIDATION',
  'OAUTH',
  'SIGNUP',
  'INVITE',
  'LOGIN'
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  password TEXT,
  email citext UNIQUE,
  name TEXT,
  nickname TEXT,
  phone TEXT,
  options JSON,
  postal_code TEXT,
  current_skills TEXT,
  desired_skills TEXT,
  waiver TIMESTAMPTZ,
  orientation TIMESTAMPTZ,
  emergency_name TEXT,
  emergency_phone TEXT,
  emergency_email citext,
  payment_method_id TEXT REFERENCES payment_methods(id),
  payment_account TEXT,
  facebook_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  legacy_id INTEGER,
  member_level INTEGER,
  version INTEGER DEFAULT 10,
  is_deleted BOOLEAN DEFAULT false,
  is_validated BOOLEAN DEFAULT false,
  email_visible BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);
CREATE TRIGGER updated_at_trigger BEFORE UPDATE
ON users FOR EACH ROW EXECUTE PROCEDURE
updated_at();

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
CREATE TRIGGER updated_at_trigger BEFORE UPDATE
ON groups FOR EACH ROW EXECUTE PROCEDURE
updated_at();

CREATE TABLE IF NOT EXISTS memberships (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  group_id TEXT REFERENCES groups(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, group_id)
);
CREATE TRIGGER updated_at_trigger BEFORE UPDATE
ON memberships FOR EACH ROW EXECUTE PROCEDURE
updated_at();

CREATE TABLE IF NOT EXISTS time_token (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  token_type token_type,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS certifications (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
CREATE TRIGGER updated_at_trigger BEFORE UPDATE
ON certifications FOR EACH ROW EXECUTE PROCEDURE
updated_at();

CREATE TABLE IF NOT EXISTS user_certifications (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cert_id INTEGER REFERENCES certifications(id) NOT NULL,
  note TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE (user_id, cert_id)
);
CREATE TRIGGER updated_at_trigger BEFORE UPDATE
ON user_certifications FOR EACH ROW EXECUTE PROCEDURE
updated_at();

CREATE TABLE IF NOT EXISTS instructors (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cert_id INTEGER REFERENCES certifications(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE (user_id, cert_id)
);
CREATE TRIGGER updated_at_trigger BEFORE UPDATE
ON instructors FOR EACH ROW EXECUTE PROCEDURE
updated_at();

CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY NOT NULL,
  first_name TEXT,
  last_name TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_file_name TEXT,
  cosigner TEXT,
  signed_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
CREATE TRIGGER updated_at_trigger BEFORE UPDATE
ON contracts FOR EACH ROW EXECUTE PROCEDURE
updated_at();

CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  card_number TEXT,
  permissions INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
CREATE TRIGGER updated_at_trigger BEFORE UPDATE
ON cards FOR EACH ROW EXECUTE PROCEDURE
updated_at();

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER,
  payment_date DATE,
  note TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
CREATE TRIGGER updated_at_trigger BEFORE UPDATE
ON payments FOR EACH ROW EXECUTE PROCEDURE
updated_at();

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  frequency TEXT,
  location TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);
CREATE TRIGGER updated_at_trigger BEFORE UPDATE
ON events FOR EACH ROW EXECUTE PROCEDURE
updated_at();

CREATE TABLE IF NOT EXISTS notices (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT,
  subject TEXT,
  comment TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
CREATE TRIGGER updated_at_trigger BEFORE UPDATE
ON notices FOR EACH ROW EXECUTE PROCEDURE
updated_at();
CREATE INDEX notices_type_idx ON notices (type);
CREATE INDEX notices_status_idx ON notices (status);

CREATE TABLE IF NOT EXISTS notice_comments (
  id SERIAL PRIMARY KEY NOT NULL,
  notice_id INTEGER REFERENCES notices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
CREATE TRIGGER updated_at_trigger BEFORE UPDATE
ON notice_comments FOR EACH ROW EXECUTE PROCEDURE
updated_at();

CREATE TABLE IF NOT EXISTS notice_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notice_id INTEGER REFERENCES notices(id),
  user_id UUID REFERENCES users(id),
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
CREATE TRIGGER updated_at_trigger BEFORE UPDATE
ON notice_images FOR EACH ROW EXECUTE PROCEDURE
updated_at();

CREATE OR REPLACE VIEW user_groups_v AS
SELECT
  u.*,
  COALESCE(
    (
      SELECT json_agg(memberships.group_id)
      FROM memberships
      WHERE user_id = u.id
    ), '[]'::json
  ) AS scope
FROM
  users AS u;

CREATE OR REPLACE VIEW user_cards_v AS
SELECT
  c.*,
  u.name,
  u.email,
  u.last_login
FROM
  users AS u,
  cards AS c
WHERE
  u.id = c.user_id;

CREATE OR REPLACE VIEW user_certifications_v AS
SELECT
  uc.*,
  u.name AS user_name,
  c.name AS cert_name,
  u.last_login
FROM
  users AS u,
  certifications AS c,
  user_certifications AS uc
WHERE
  u.id = uc.user_id
  AND uc.cert_id = c.id;

CREATE OR REPLACE VIEW memberships_v AS
SELECT
  m.*,
  u.name AS user_name,
  u.email,
  u.last_login
FROM
  users AS u,
  memberships AS m
WHERE
  u.id = m.user_id;

CREATE OR REPLACE VIEW instructors_v AS
SELECT
  i.*,
  u.name AS user_name,
  c.name AS cert_name,
  u.last_login
FROM
  users AS u,
  certifications AS c,
  instructors AS i
WHERE
  u.id = i.user_id
  AND i.cert_id = c.id;

CREATE OR REPLACE VIEW notices_v AS
SELECT
  n.*,
  u.name AS user_name,
  COALESCE(
    (
      SELECT json_agg(notice_images.id)
      FROM notice_images
      WHERE notice_id = n.id
    ), '[]'::json
  ) AS images
FROM
  users AS u,
  notices AS n
WHERE
  u.id =  n.user_id;

CREATE OR REPLACE VIEW notice_comments_v AS
SELECT
  nc.*,
  u.name AS user_name,
  n.subject,
  n.status,
  n.type
FROM
  users AS u,
  notices AS n,
  notice_comments AS nc
WHERE
  u.id = nc.user_id
  AND n.id = nc.notice_id;


-- seed data
INSERT INTO users (id, password,email,name,is_validated,member_level) VALUES ('badaf5f6-cdc8-4be7-af46-c5f78e748a55', crypt('Testing1!', gen_salt('bf',10)),'admin@example.com','Admin',true,100);
INSERT INTO users (password,email,name,is_validated,member_level) VALUES (crypt('Testing1!', gen_salt('bf',10)),'gobie@example.com','Gobie McDaniels',true,5);
INSERT INTO users (password,email,name,is_validated,member_level) VALUES (crypt('Testing1!', gen_salt('bf',10)),'jimbo@example.com','Jimbo Fargo',false,1);
INSERT INTO users (password,email,name,is_validated,member_level) VALUES (crypt('Testing1!', gen_salt('bf',10)),'hardy@example.com','Hardy Bridle',true,10);

INSERT INTO payment_methods (id) VALUES ('CASH');
INSERT INTO payment_methods (id) VALUES ('PAYPAL');
INSERT INTO groups (id, description) VALUES ('ADMIN', 'Admin users');

INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(1, 'Laser Cutter', 'Managed by Milton', '2013-01-25 16:19:24.331172', '2014-02-23 06:08:12.476114');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(2, 'Mill (CNC)', 'Prerequisite: Big Mill Managed by Oliver Fultz, Larry Campbell', '2013-01-25 16:19:44.716051', '2014-03-12 15:15:20.386834');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(3, 'Mill (Big)', 'Managed by Jasper Nance or Will Bradley', '2013-01-25 16:19:57.269947', '2014-02-23 06:08:31.062376');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(4, 'Mill (Mini)', 'Managed by Jasper Nance or Will Bradley', '2013-01-25 16:20:04.541371', '2014-02-23 06:08:36.587248');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(5, 'Lathe (mini)', 'Managed by Jasper Nance (Backup is Larry Campbell)', '2013-01-25 16:20:11.656333', '2014-11-04 05:43:33.612022');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(6, 'Lathe (Big)', 'Managed by Jasper Nance', '2013-01-25 16:20:20.595122', '2014-02-23 06:08:19.075655');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(7, 'Welder (MIG)', 'Managed by Austin Kipp', '2013-01-25 16:20:32.780636', '2014-02-23 06:08:43.017');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(8, 'Welder (TIG)', 'Prerequisite: MIG Welder Managed by Austin Kipp', '2013-01-25 16:20:53.220831', '2014-02-23 06:08:46.477245');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(9, 'Table Saw', 'table saw', '2014-02-07 21:30:18.813289', '2014-02-23 06:08:39.593008');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(10, 'Plasma Cutter', 'Hobart 500534R 250ci Reconditioned A-Stock AirForce', '2014-04-11 02:08:58.334201', '2014-04-11 02:08:58.334201');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(12, 'Laser Cutter (small)', 'Managed by Milton', '2013-01-25 16:19:24.331172', '2014-02-23 06:08:12.476114');
ALTER SEQUENCE certifications_id_seq RESTART WITH 12;

INSERT INTO events (id,name, description, start_date, end_date, frequency, location, created_by) VALUES('4909f5f6-cdc8-4be7-af46-c5f78e748a6a','Laser Class', 'Join this class!' || chr(13) || chr(10) || 'It''s fun!', '2019-10-11 13:00:00', '2019-10-11 15:00:00', 'weekly', 'HeatSync Labs', 'badaf5f6-cdc8-4be7-af46-c5f78e748a55');
