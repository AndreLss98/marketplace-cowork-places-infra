exports.up = knex => knex.schema.createTable('possibilidade_campo_selecao', table => {
    table.increments('id').primary().notNullable();
    table.integer('campo_selecao_id').notNullable().references('id').inTable('campo_selecao');
    table.string('valor', 100).notNullable();
});

exports.down = knex => knex.schema.dropTable('possibilidade_campo_selecao');
