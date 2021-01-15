exports.up = knex => knex.schema.createTable('tipo_alugavel_documento', table => {
    table.increments('id').notNullable().primary();
    table.boolean('exclusivo_locatario').notNullable().default(false);
    table.string('example_file_url', 200);
    table.string('nome', 200).notNullable();
    table.string('url_arq_exemplo', 200);
});

exports.down = knex => knex.schema.dropTable('tipo_alugavel_documento');
