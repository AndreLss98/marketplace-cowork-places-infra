exports.up = knex => knex.schema.createTable('banco', table => {
    table.integer('codigo').notNullable().primary();
    table.string('nome', 200).notNullable();
});

exports.down = knex => knex.schema.dropTable('banco');