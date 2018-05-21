
const config = require('./config');
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
  const contracts = await oldbread.raw(`select * from contracts`);

  console.log('users', users.length, 'contracts', contracts.length);

  const userPromises = [];
  users.forEach((user) => {
    let u = user;
    u.legacy_id = u.id;
    u.password = u.encrypted_password;
    u.is_validated = true;
    u.payment_method = u.payment_method ? u.payment_method.toUpperCase() : null;

    if(u.payment_method !== 'PAYPAL' && u.payment_method !== 'CASH') {
      u.payment_method = null;
    }
    u = omit(pick(u, userFields), 'id');

    const p = bread.add('users', userFields, u)
      .then((nu) => {
        newUsers[nu.legacy_id] = nu;
        console.log('new user', nu, user);
        if(user.admin) {
          return bread.add('memberships', ['user_id', 'group_id'], {user_id: nu.id, group_id: 'ADMIN'})
            .then((newMem) => {
              console.log('new membership', nu.name, newMem);
              return nu;
            });
        }
        return nu;
      });
    userPromises.push(p);
  });
  const usersSaved = await Promise.all(userPromises);

  forEach(users, (user) => {
    forEach(user.user_cards, async (userCard) => {
      let uc = userCard;
      if(uc.user_id && newUsers[uc.user_id]) {
        uc.user_id = newUsers[uc.user_id].id;
        uc.permissions = userCard.card_permissions;
        uc.note = userCard.name;
        uc = pick(uc, cardFields);
        const nuc = await bread.add('cards', cardFields, uc);
        console.log('new card', nuc, userCard);
      }
    });
  });

  forEach(users, (user) => {
    forEach(user.user_certs, async (userCert) => {
      let uc = userCert;
      if(uc.user_id && newUsers[uc.user_id]) {
        uc.user_id = newUsers[uc.user_id].id;
        if(uc.created_by && newUsers[uc.created_by]) {
          uc.created_by = newUsers[uc.created_by].id;
        }
        uc.cert_id = userCert.certification_id;
        uc = pick(uc, userCertFields);
        const nuc = await bread.add('user_certifications', userCertFields, uc);
        console.log('new cert', nuc, userCert);
      }
    });
  });

  forEach(users, (user) => {
    forEach(user.user_payments, async (userPayment) => {
      let up = userPayment;
      if(up.user_id && newUsers[up.user_id]) {
        up.user_id = newUsers[up.user_id].id;
        if(up.created_by && newUsers[up.created_by]) {
          up.created_by = newUsers[up.created_by].id;
        }
        if(up.amount) {
          up.amount = Math.floor(up.amount * 100);
        } else {
          up.amount = null;
        }
        up = pick(up, paymentFields);
        const nup = await bread.add('payments', paymentFields, up);
        console.log('new payment', up, userPayment);
      }
    });
  });



  forEach(contracts, async (contract) => {
    let c = contract;
    if(c.user_id && newUsers[c.user_id]) {
      c.user_id = newUsers[c.user_id].id;
    }
    else{
      c.user_id = null;
    }
    c = pick(c, contractFields);
    const nc = await bread.add('contracts', contractFields, c);
    console.log('new contract', nc, contract);
  });
}

run();
