exports.up = knex => knex.schema.createTable('cadastro_terceiro', table => {
    table.increments('id').notNullable().primary();
    table.string('cnpj', 20);
    table.string('cpf', 16);
    table.string('nome', 250);
    table.string('razao_social', 250);
    table.integer('alugavel_id').notNullable().references('id').inTable('alugavel');
});

exports.down = knex => knex.schema.dropTable('cadastro_terceiro');