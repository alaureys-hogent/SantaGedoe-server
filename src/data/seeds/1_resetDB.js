const { tables } = require('..');

module.exports = {
  seed: async (knex) => {
    //first delete all entries in every table
    await knex(tables.user).delete();
    await knex(tables.gift).delete();
  },
};