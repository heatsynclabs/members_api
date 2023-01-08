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
const debug = require('debug')('seed');

const bread = require('breadfruit')({
  client: 'postgresql',
  connection: process.env.NEW_DB_URL,
  pool: { min: 2, max: 10 }
});

const oldbread = require('breadfruit')({
  client: 'postgresql',
  connection: process.env.OLD_DB_URL,
  pool: { min: 1, max: 7 }
});

const { pick, omit, forEach } = require('lodash');

const userFields = [
  'id',
  'name',
  'password',
  'email',
  'email_visible',
  'name',
  'phone',
  'member_level',
  'current_skills',
  'desired_skills',
  'waiver',
  'orientation',
  'emergency_name',
  'emergency_phone',
  'emergency_email',
  'payment_method_id',
  'payment_account',
  'facebook_url',
  'github_url',
  'twitter_url',
  'website_url',
  'legacy_id',
  'is_validated',
  'created_at',
  'updated_at',
  'postal_code'
];

const cardFields = [
  'id',
  'user_id',
  'card_number',
  'permissions',
  'note',
  'created_at',
  'updated_at'
];

const contractFields = [
  'id',
  'user_id',
  'first_name',
  'last_name',
  'cosigner',
  'document_file_name',
  'signed_at',
  'created_by',
  'created_at',
  'updated_at'
];

const userCertFields = [
  'user_id',
  'cert_id',
  'created_by',
  'created_at',
  'updated_at',
];

const paymentFields = [
  'id',
  'user_id',
  'amount',
  'payment_date',
  'note',
  'created_by',
  'created_at',
  'updated_at'
];

const newUsers = {};

async function run() {
  const users = await oldbread.raw(`
  select
    u.*,
    (select json_agg(c.*) from cards c where c.user_id = u.id) as user_cards,
    (select json_agg(uc.*) from user_certifications uc where uc.user_id = u.id) as user_certs,
    (select json_agg(p.*) from payments p where p.user_id = u.id) as user_payments
  from users u
  order by u.id
  `);
  const contracts = await oldbread.raw('select * from contracts');

  debug('users', users.length, 'contracts', contracts.length);

  for (let index = 0; index < users.length; index += 1) {
    const user = users[index];
    let u = user;
    u.legacy_id = u.id;
    u.password = u.encrypted_password;
    u.is_validated = true;
    u.payment_method = u.payment_method ? u.payment_method.toUpperCase() : null;

    if (u.payment_method !== 'PAYPAL' && u.payment_method !== 'CASH') {
      u.payment_method = null;
    }
    u = omit(pick(u, userFields), 'id');

    const existingUser = await bread.read('users', '*', { email: u.email });
    let nu;

    if (existingUser) {
      console.log('EXISTING', u);
      nu = await bread.edit('users', userFields, u, { id: existingUser.id });
    } else {
      // console.log('NEW', u);
      nu = await bread.add('users', userFields, u);
    }

    if (user.admin) {
      const newMem = await bread.add('memberships', ['user_id', 'group_id'], { user_id: nu.id, group_id: 'ADMIN' });
      debug('new membership', nu.name, newMem);
    }

    newUsers[nu.legacy_id] = nu;

    debug('new user', nu, user);
  }

  forEach(users, (user) => {
    forEach(user.user_cards, async (userCard) => {
      let uc = userCard;
      if (uc.user_id && newUsers[uc.user_id]) {
        uc.user_id = newUsers[uc.user_id].id;
        uc.permissions = userCard.card_permissions;
        uc.note = userCard.name;
        uc = pick(uc, cardFields);
        const nuc = await bread.add('cards', cardFields, uc);
        debug('new card', nuc, userCard);
      }
    });
  });

  forEach(users, (user) => {
    forEach(user.user_certs, async (userCert) => {
      let uc = userCert;
      if (uc.user_id && newUsers[uc.user_id]) {
        uc.user_id = newUsers[uc.user_id].id;
        if (uc.created_by && newUsers[uc.created_by]) {
          uc.created_by = newUsers[uc.created_by].id;
        }
        uc.cert_id = userCert.certification_id;
        uc = pick(uc, userCertFields);
        await bread.add('user_certifications', userCertFields, uc);
      }
    });
  });

  forEach(users, (user) => {
    forEach(user.user_payments, async (userPayment) => {
      let up = userPayment;
      if (up.user_id && newUsers[up.user_id]) {
        up.user_id = newUsers[up.user_id].id;
        if (up.created_by && newUsers[up.created_by]) {
          up.created_by = newUsers[up.created_by].id;
        }
        if (up.amount) {
          up.amount = Math.floor(up.amount * 100);
        } else {
          up.amount = null;
        }
        up = pick(up, paymentFields);
        const nup = await bread.add('payments', paymentFields, up);
        debug('new payment', up, userPayment, nup);
      }
    });
  });

  forEach(contracts, async (contract) => {
    let c = contract;
    if (c.user_id && newUsers[c.user_id]) {
      c.user_id = newUsers[c.user_id].id;
    } else {
      c.user_id = null;
    }
    c = pick(c, contractFields);
    const nc = await bread.add('contracts', contractFields, c);
    debug('new contract', nc, contract);
  });
}

run();
