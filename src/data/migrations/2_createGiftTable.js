const { tables } = require('..');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.gift, (table) => {
      table.uuid('id')
        .primary();
      
      table.string('name', 255);
      table.string('comments', 500);
      table.string('url');
      table.boolean('isReserved');
      table.string('reservedBy');
      table.boolean('isReceived');
      table.uuid('user_id')
        .notNullable();
      
      table.foreign('user_id', 'fk_gift_user')
        .references(`${tables.user}.id`)
        .onDelete('CASCADE');
    });
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.gift);
  },
};