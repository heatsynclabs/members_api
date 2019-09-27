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
  'VALIDATION'
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

CREATE TABLE IF NOT EXISTS memberships (
  user_id UUID REFERENCES users(id) NOT NULL,
  group_id TEXT REFERENCES groups(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(user_id, group_id)
);

CREATE TABLE IF NOT EXISTS time_token (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS user_certifications (
  user_id UUID REFERENCES users(id) NOT NULL,
  cert_id INTEGER REFERENCES certifications(id) NOT NULL,
  note TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  PRIMARY KEY(user_id, cert_id)
);

CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY NOT NULL,
  first_name TEXT,
  last_name TEXT,
  user_id UUID REFERENCES users(id),
  document_file_name TEXT,
  cosigner TEXT,
  signed_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  card_number TEXT,
  permissions INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  amount INTEGER,
  payment_date DATE,
  note TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- seed data
INSERT INTO users (password,email,name,is_validated,member_level) VALUES (crypt('Testing1!', gen_salt('bf',10)),'admin@example.com','Admin',true,100);
INSERT INTO users (password,email,name,is_validated,member_level) VALUES (crypt('Testing1!', gen_salt('bf',10)),'gobie@example.com','Gobie McDaniels',true,5);
INSERT INTO users (password,email,name,is_validated,member_level) VALUES (crypt('Testing1!', gen_salt('bf',10)),'jimbo@example.com','Jimbo Fargo',false,1);
INSERT INTO users (password,email,name,is_validated,member_level) VALUES (crypt('Testing1!', gen_salt('bf',10)),'hardy@example.com','Hardy Bridle',true,10);

INSERT INTO payment_methods (id) VALUES ('CASH');
INSERT INTO payment_methods (id) VALUES ('PAYPAL');
INSERT INTO groups (id, description) VALUES ('ADMIN', 'Admin users');

INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(1, 'Laser Cutter', 'Managed by Ryan McDermott', '2013-01-25 16:19:24.331172', '2014-02-23 06:08:12.476114');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(2, 'Mill (CNC)', 'Prerequisite: Big Mill Managed by Oliver Fultz, Larry Campbell', '2013-01-25 16:19:44.716051', '2014-03-12 15:15:20.386834');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(3, 'Mill (Big)', 'Managed by Jasper Nance or Will Bradley', '2013-01-25 16:19:57.269947', '2014-02-23 06:08:31.062376');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(4, 'Mill (Mini)', 'Managed by Jasper Nance or Will Bradley', '2013-01-25 16:20:04.541371', '2014-02-23 06:08:36.587248');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(5, 'Lathe (mini)', 'Managed by Jasper Nance (Backup is Larry Campbell)', '2013-01-25 16:20:11.656333', '2014-11-04 05:43:33.612022');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(6, 'Lathe (Big)', 'Managed by Jasper Nance', '2013-01-25 16:20:20.595122', '2014-02-23 06:08:19.075655');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(7, 'Welder (MIG)', 'Managed by Austin Kipp', '2013-01-25 16:20:32.780636', '2014-02-23 06:08:43.017');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(8, 'Welder (TIG)', 'Prerequisite: MIG Welder Managed by Austin Kipp', '2013-01-25 16:20:53.220831', '2014-02-23 06:08:46.477245');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(9, 'Table Saw', 'table saw', '2014-02-07 21:30:18.813289', '2014-02-23 06:08:39.593008');
INSERT INTO certifications (id, name, description, created_at, updated_at) VALUES(10, 'Plasma Cutter', 'Hobart 500534R 250ci Reconditioned A-Stock AirForce', '2014-04-11 02:08:58.334201', '2014-04-11 02:08:58.334201');
ALTER SEQUENCE certifications_id_seq RESTART WITH 11;
