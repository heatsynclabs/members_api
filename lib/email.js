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
  sendReset
};
