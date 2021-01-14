exports.up = knex => knex.schema.createTable('pessoa_juridica', table => {
    table.increments('id').notNullable().primary();
    table.string('cnpj', 20).notNullable();
    table.string('razao_social', 250).notNullable();
    table.integer('conta_bancaria_id').references('id').inTable('conta_bancaria');
});

exports.down = knex => knex.schema.dropTable('pessoa_juridica');
