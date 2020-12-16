exports.up = knex => knex.schema.createTable('campo_numerico', table => {
    table.increments('id').notNullable().primary();
    table.string('placeholder', 100);
});

exports.down = knex => knex.schema.dropTable('campo_numerico');
