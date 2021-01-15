exports.up = knex => knex.schema.createTable('usuario_documento', table => {
    table.integer('usuario_id').notNullable().references('id').inTable('usuario');
    table.integer('documento_id').notNullable().references('id').inTable('documento');
    table.timestamp('data_insercao').default(knex.fn.now());
    table.string('url', 250).notNullable();
});

exports.down = knex => knex.schema.dropTable('usuario_documento');