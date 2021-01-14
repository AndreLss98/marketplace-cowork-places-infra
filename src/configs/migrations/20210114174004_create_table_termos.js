exports.up = knex => knex.schema.createTable('termos', table => {
    table.integer('usuario_id').notNullable().primary().references('id').inTable('usuario');
    table.boolean('aceito').notNullable().default(false);
    table.string('versao', 50);
});

exports.down = knex => knex.schema.dropTable('termos');
