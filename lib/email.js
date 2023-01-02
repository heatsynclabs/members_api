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

const debug = require('debug')('errors');
const nodemailer = require('nodemailer');
const config = require('../config');

let transport = {
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: config.email.SENDGRID_API_KEY,
  }
};
if (!config.email.SENDGRID_API_KEY || config.email.SENDGRID_API_KEY === '') {
  transport = {
    host: config.email.SMTP_HOST,
    port: config.email.SMTP_PORT,
    secure: config.email.SMTP_SECURE === 'true',
  };
  if (config.email.SMTP_USER !== '' && config.email.SMTP_PASSWORD !== '') {
    transport.auth = {
      user: config.email.SMTP_USER,
      pass: config.email.SMTP_PASSWORD,
    };
  }
}

const transporter = nodemailer.createTransport(transport);

function send(msg) {
  if (config.email.disable_sending) {
    debug('Email sending disabled. Would have sent: ', msg);
    return true;
  }

  return transporter.sendMail(msg);
}

function sendValidation(email, token) {
  const msg = {
    to: email,
    from: config.admin_email,
    subject: 'Please Validate Your Email',
    text: 'Validate Link',
    html: `<html>
      <p>
        Please click the link below to validate your account. If you did not request this, please disregard
      </p>
      <p>
        <a href='${config.domain}/validate/${token}'>Click Here To Validate</a>
      </p>
    </html>`,
  };

  return send(msg);
}

function sendEmailSignup(email, token) {
  const msg = {
    to: email,
    from: config.admin_email,
    subject: 'Please Verify Your Email',
    text: 'verify Link',
    html: `<html>
      <p>
        Please click the link below to verify your email and create your ${config.siteName} account. If you did not request this, please disregard.
      </p>
      <p>
        <a href='${config.server_url}/users/email_token/${token}'>Click Here To verify</a>
      </p>
    </html>`,
  };

  return send(msg);
}

function sendLogin(email, token) {
  const msg = {
    to: email,
    from: config.admin_email,
    subject: 'Log in to your account',
    text: 'Log in Link',
    html: `<html>
      <p>
        Please click the link below to log in to your ${config.siteName} account. If you did not request this, please disregard
      </p>
      <p>
        <a href='${config.domain}/login/${token}'>Click Here to log in</a>
      </p>
    </html>`,
  };

  return send(msg);
}

function sendReset(email, token) {
  const msg = {
    to: email,
    from: config.admin_email,
    subject: 'Request To Reset Email',
    text: 'Reset Email',
    html: `<html>
    <p>
      Please click the link below to reset your password. If you did not request this, please disregard
    </p>
    <p>
      <a href='${config.domain}/reset/${token}'>Click Here To Reset</a>
    </p>
  </html>`,
  };

  return send(msg);
}

module.exports = {
  sendValidation,
  sendReset,
  sendLogin,
  sendEmailSignup,
};
