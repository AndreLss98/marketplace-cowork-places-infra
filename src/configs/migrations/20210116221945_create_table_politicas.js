exports.up = knex => knex.schema.createTable('politicas', table => {
    table.increments('id').notNullable().primary();
    table.string('nome', 150).notNullable().unique();
    table.string('versao', 10).notNullable();
    table.string('url', 150).notNullable().unique();
    table.boolean('aprovado').notNullable().default(false);
});

exports.down = knex => knex.schema.dropTable('politicas');
