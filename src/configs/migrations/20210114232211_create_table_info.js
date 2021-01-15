exports.up = knex => knex.schema.createTable('info', table => {
    table.increments('id').notNullable().primary();
    table.integer('alugavel_id').notNullable().references('id').inTable('alugavel');
    table.string('descricao', 200).notNullable();
    table.unique(['alugavel_id', 'descricao']);
});

exports.down = knex => knex.schema.dropTable('info');
