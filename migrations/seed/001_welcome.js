/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const bcrypt = require('bcrypt');
const config = require('../../config');

const seedUserPassword = 'Testing1!!';
const hashedSeedUserPassword = bcrypt.hashSync(seedUserPassword, 10);

exports.seed = async (knex) => {
  // Create a handful of users, including an Admin user
  await knex('users')
    .insert([
      {
        password: hashedSeedUserPassword,
        email: config.admin_email,
        name: 'Admin',
        is_validated: true,
        member_level: 100,
      },
      {
        password: hashedSeedUserPassword,
        email: 'gobie@example.com',
        name: 'Gobie McDaniels',
        is_validated: true,
        member_level: 5,
      },
      {
        password: hashedSeedUserPassword,
        email: 'jimbo@example.com',
        name: 'Jimbo Fargo',
        is_validated: false,
        member_level: 1,
      },
      {
        password: hashedSeedUserPassword,
        email: 'hardy@example.com',
        name: 'Hardy Bridle',
        is_validated: true,
        member_level: 10,
      },
    ])
    .onConflict('email')
    .merge();

  // Create the ADMIN group, to which the Admin user will belong
  await knex('groups')
    .insert({ id: 'ADMIN' })
    .onConflict('id')
    .merge();

  // Find the Admin user, to make sure we have the correct id
  const { id: adminUserId } = await knex('users')
    .where('email', config.admin_email)
    .first('id');

  // Add the Admin user to the ADMIN group
  await knex('memberships')
    .insert([
      { user_id: adminUserId, group_id: 'ADMIN' },
    ])
    .onConflict(['group_id', 'user_id'])
    .merge();

  // Create the Laser Class;
  //   first try and find an existing Admin Laser Class,
  //   then create one if it doesn't already exist
  const adminLaserClass = await knex('events')
    .where({ created_by: adminUserId, name: 'Laser Class' })
    .select(['id'])
    .first();

  if (!adminLaserClass) {
    await knex('events')
      .insert([
        {
          name: 'Laser Class',
          description: "Join this class!\r\nIt's fun!",
          start_date: '2019-10-11 13:00:00',
          end_date: '2019-10-11 15:00:00',
          frequency: 'weekly',
          location: 'HeatSync Labs',
          created_by: adminUserId,
        },
      ]);
  }
};
