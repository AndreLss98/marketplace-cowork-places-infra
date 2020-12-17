exports.up = knex => knex.schema.createTable('conta_bancaria', table => {
    table.increments('id').notNullable().primary();
    table.integer('codigo_banco').notNullable().references('codigo').inTable('banco');
    table.string('agencia', 100).notNullable();
    table.string('numero', 100).notNullable();
    table.string('tipo', 256).notNullable();
});

exports.down = knex => knex.schema.dropTable('conta_bancaria');