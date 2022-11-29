const { tables } = require('..');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.user, (table) => {
      table.uuid('id')
        .primary();

      table.string('firstName', 255)
        .notNullable();

      table.string('lastName', 255)
        .notNullable();

      table.string('img');
    });
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.user);
  },
};