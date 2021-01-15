exports.up = knex => knex.schema.createTable('questionario_usuario', table => {
    table.integer('usuario_id').notNullable().references('id').inTable('usuario');
    table.integer('pergunta_id').notNullable().references('id').inTable('questionario');
    table.string('resposta', 200).notNullable();
});

exports.down = knex => knex.schema.dropTable('questionario_usuario');
