exports.up = knex => knex.schema.createTable('questionario', table => {
    table.increments('id').notNullable().primary();
    table.string('pergunta', 200).notNullable().unique();
});

exports.down = knex => knex.schema.dropTable('questionario');
