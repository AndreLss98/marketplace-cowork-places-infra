exports.up = knex => knex.schema.createTable('tipo_alugavel_documento_tipo', table => {
    table.integer('tipo_alugavel_documento_id').notNullable().references('id').inTable('tipo_alugavel_documento').onDelete('CASCADE');
    table.integer('tipo_id').notNullable().references('id').inTable('tipo').onDelete('CASCADE');
    table.primary(['tipo_alugavel_documento_id', 'tipo_id']);
});

exports.down = knex => knex.schema.dropTable('tipo_alugavel_documento_alugavel');
