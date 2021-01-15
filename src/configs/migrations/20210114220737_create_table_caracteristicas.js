exports.up = knex => knex.schema.createTable('caracteristica', table => {
    table.increments('id').notNullable().primary();
    table.integer('tipo_campo_id').notNullable().references('id').inTable('tipo_campo');
    table.string('nome', 100).notNullable().unique();
    table.string('icone', 100);
    table.string('unidade_medida', 100);
});

exports.down = knex => knex.schema.dropTable('caracteristica');