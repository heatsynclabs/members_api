module.exports = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/hsl',
  pool: {
    min: 1,
    max: 7,
  },
  seeds: {
    directory: './migrations/seed'
  },
  test: {
    connection: process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/hsl-test',
    pool: {
      min: 1,
      max: 7,
    },
    seeds: {
      directory: './migrations/seed'
    }
  }
}
