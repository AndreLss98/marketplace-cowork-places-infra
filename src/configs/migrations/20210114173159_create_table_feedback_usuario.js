exports.up = knex => knex.schema.createTable('feedback_usuario', table => {
    table.integer('usuario_id').notNullable().references('id').inTable('usuario');
    table.integer('feedback_id').notNullable().references('id').inTable('feedback');
    table.string('resposta', 100).notNullable();
});

exports.down = knex => knex.schema.dropTable('feedback_usuario');
