exports.up = knex => knex.schema.createTable('documento', table => {
    table.increments('id').notNullable().primary();
    table.string('nome', 150).notNullable().unique();
    table.boolean('avancado').notNullable();
    table.string('icone', 150);
});

exports.down = knex => knex.schema.dropTable('documento');