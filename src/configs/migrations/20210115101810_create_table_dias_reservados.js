exports.up = knex => knex.schema.createTable('dias_reservados', table => {
    table.date('data_entrada').notNullable();
    table.date('data_saida').notNullable();
    table.integer('aluguel_id').references('id').inTable('aluguel').default(null);
    table.integer('alugavel_id').notNullable().references('id').inTable('alugavel');

});

exports.down = knex => knex.schema.dropTable('dias_reservados');