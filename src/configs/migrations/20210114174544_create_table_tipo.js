exports.up = knex => knex.schema.createTable('tipo', table => {
    table.increments('id').notNullable().primary();
    table.string('nome', 100).notNullable().unique();
    table.string('icone', 200).notNullable();
    table.boolean('disponivel').notNullable().default(false);
    table.string('descricao', 256).notNullable();
    table.string('chamado', 100).notNullable();
    table.string('desc_chamado', 100);
});

exports.down = knex => knex.schema.dropTable('tipo');
