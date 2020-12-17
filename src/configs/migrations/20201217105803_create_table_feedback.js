exports.up = knex => knex.schema.createTable('feedback', table => {
    table.increments('id').notNullable().primary();
    table.string('pergunta', 250).unique().notNullable();
    table.string('nome_campo', 100).unique();
    table.integer('tipo_campo_id').notNullable().references('id').inTable('tipo_campo');
    table.boolean('fixa').default(false);
});

exports.down = knex => knex.schema.dropTable('feedback');