const Joi = require('joi');
const breadModel = require('../lib/breadModel');

const model = breadModel({
  name: 'all_users',
  viewName: 'all_users_v',
  schema: {
    id: Joi.string().uuid(),
  },
  viewOnly: {
    name: Joi.string(),
    email: Joi.string(),
    nickname: Joi.string(),
    phone: Joi.string(),
    postal_code: Joi.string(),
    last_login: Joi.date(),
    created_at: Joi.date(),
  }
});

// id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
// password TEXT,
// email citext UNIQUE,
// name TEXT,
// nickname TEXT,
// phone TEXT,
// options JSON,
// postal_code TEXT,
// current_skills TEXT,
// desired_skills TEXT,
// waiver TIMESTAMPTZ,
// orientation TIMESTAMPTZ,
// emergency_name TEXT,
// emergency_phone TEXT,
// emergency_email citext,
// payment_method_id TEXT REFERENCES payment_methods(id),
// payment_account TEXT,
// facebook_url TEXT,
// github_url TEXT,
// twitter_url TEXT,
// website_url TEXT,
// legacy_id INTEGER,
// member_level INTEGER,
// version INTEGER DEFAULT 10,
// is_deleted BOOLEAN DEFAULT false,
// is_validated BOOLEAN DEFAULT false,
// email_visible BOOLEAN DEFAULT true,
// last_login TIMESTAMPTZ,
// created_at TIMESTAMPTZ DEFAULT NOW(),
// updated_at TIMESTAMPTZ,
// deleted_at TIMESTAMPTZ

module.exports = model;
