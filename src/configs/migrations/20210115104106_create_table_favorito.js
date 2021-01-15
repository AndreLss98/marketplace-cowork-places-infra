exports.up = knex => knex.schema.createTable('favorito', table => {
    table.integer('usuario_id').notNullable().references('id').inTable('usuario');
    table.integer('alugavel_id').notNullable().references('id').inTable('alugavel');
    table.primary(['usuario_id', 'alugavel_id']);
});

exports.down = knex => knex.schema.dropTable('favorito');