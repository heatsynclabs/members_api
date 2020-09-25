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

const sgMail = require('@sendgrid/mail');
const config = require('../config');

sgMail.setApiKey(config.sendgrid.SENDGRID_API_KEY);

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
  if (config.sendgrid.disable_sending) {
    console.log('SendGrid sending disabled. Would have sent: ',msg);
    return true;
  } else {
    return sgMail.send(msg);
  }
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
  if (config.sendgrid.disable_sending) {
    console.log('SendGrid sending disabled. Would have sent: ',msg);
    return true;
  } else {
    return sgMail.send(msg);
  }
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
  if (config.sendgrid.disable_sending) {
    console.log('SendGrid sending disabled. Would have sent: ',msg);
    return true;
  } else {
    return sgMail.send(msg);
  }
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
  if (config.sendgrid.disable_sending) {
    console.log('SendGrid sending disabled. Would have sent: ',msg);
    return true;
  } else {
    return sgMail.send(msg);
  }
}

module.exports = {
  sendValidation,
  sendReset,
  sendLogin,
  sendEmailSignup,
};
