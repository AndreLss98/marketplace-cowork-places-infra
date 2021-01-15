exports.up = knex => knex.schema.createTable('publico_alvo', table => {
    table.increments('id').notNullable().primary();
    table.string('nome', 100).notNullable().unique();
});

exports.down = knex => knex.schema.dropTable('publico_alvo');