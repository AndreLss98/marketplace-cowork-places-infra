exports.up = knex => knex.schema.createTable('alugavel_imagem', table => {
    table.increments('id').notNullable().primary();
    table.integer('alugavel_id').references('id').inTable('alugavel');
    table.string('url', 250).notNullable();
});

exports.down = knex => knex.schema.dropTable('alugavel_imagem');