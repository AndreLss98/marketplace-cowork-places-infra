exports.up = knex => knex.schema.createTable('campo_area_texto', table => {
    table.increments('id').notNullable().primary();
    table.integer('min_rows');
    table.integer('max_rows');
    table.integer('max_length');
});

exports.down = knex => knex.schema.dropTable('campo_area_texto');
