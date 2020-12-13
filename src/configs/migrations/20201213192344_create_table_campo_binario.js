exports.up = knex => knex.schema.createTable('campo_binario', table => {
    table.increments('id').notNullable().primary();
    table.boolean('standard').default(false);
});

exports.down = knex => knex.schema.dropTable('campo_binario');
