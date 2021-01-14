exports.up = knex => knex.schema.createTable('duvida', table => {
    table.increments('id').notNullable().primary();
    table.integer('usuario_id').references('id').inTable('usuario');
    table.integer('alugavel_id').references('id').inTable('alugavel');
    table.boolean('aceito').default(false).notNullable();
    table.string('pergunta', 250).notNullable();
    table.string('resposta', 250);
});

exports.down = knex => knex.schema.dropTable('duvida');