exports.up = knex => knex.schema.createTable('tipo_alugavel_documento_alugavel', table => {
    table.increments('id').notNullable().primary();
    table.integer('tipo_alugavel_documento_id').notNullable().references('id').inTable('tipo_alugavel_documento').onDelete('CASCADE');
    table.integer('alugavel_id').notNullable().references('id').inTable('alugavel').onDelete('CASCADE');
    table.string('url', 200).notNullable();
});

exports.down = knex => knex.schema.dropTable('tipo_alugavel_documento_alugavel');