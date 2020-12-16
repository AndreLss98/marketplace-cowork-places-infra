exports.up = knex => knex.schema.createTable('campo_intervalo', table => {
    table.increments('id').notNullable().primary();
    table.integer('standard');
    table.integer('min');
    table.integer('max');
    table.integer('step');
});

exports.down = knex => knex.schema.dropTable('campo_intervalo');
