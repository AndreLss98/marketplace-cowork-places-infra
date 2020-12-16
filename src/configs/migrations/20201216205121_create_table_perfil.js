exports.up = knex => knex.schema.createTable('perfil', table => {
    table.increments('id').notNullable().primary();
    table.integer('nivel').notNullable().unique();
    table.string('nome', 250).notNullable().unique();
});

exports.down = knex => knex.schema.dropTable('perfil'); 
