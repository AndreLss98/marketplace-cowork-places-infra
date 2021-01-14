exports.up = knex => knex.schema.createTable('endereco', table => {
    table.integer('numero');
    table.string('bairro', 200);
    table.string('complemento', 250);
    table.string('cep', 10).notNullable();
    table.string('rua', 200).notNullable();
    table.string('pais', 200).notNullable();
    table.string('cidade', 200).notNullable();
    table.string('estado', 200).notNullable();
    table.integer('pessoa_juridica_id').references('id').inTable('pessoa_juridica');
    table.integer('cadastro_terceiro_id').references('id').inTable('cadastro_terceiro')
});

exports.down = knex => knex.schema.dropTable('endereco');