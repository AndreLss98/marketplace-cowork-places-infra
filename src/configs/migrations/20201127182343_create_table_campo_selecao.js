exports.up = knex => knex.schema.createTable('campo_selecao', table => {
    table.increments('id').primary().notNullable();
    table.boolean('multiple').defaultTo(false);
});

exports.down = knex => knex.schema.dropTable('campo_selecao');