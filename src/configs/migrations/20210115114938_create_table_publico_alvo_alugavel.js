exports.up = knex => knex.schema.createTable('publico_alvo_alugavel', table => {
    table.integer('publico_alvo_id').notNullable().references('id').inTable('publico_alvo').onDelete('CASCADE');
    table.integer('alugavel_id').notNullable().references('id').inTable('alugavel').onDelete('CASCADE');
});

exports.down = knex => knex.schema.dropTable('publico_alvo_alugavel');