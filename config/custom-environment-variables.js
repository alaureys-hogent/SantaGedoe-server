module.exports = {
  env: 'NODE_ENV',
  database: {
    host: 'DATABASE_HOST',
    port: 'DATABASE_PORT',
    username: 'DATABASE_USERNAME',
    password: 'DATABASE_PASSWORD',
    name: 'DATABASE_NAME',
  },
  auth: {
    jwt: {
      secret: 'JWT_SECRET',
    },
  },
};