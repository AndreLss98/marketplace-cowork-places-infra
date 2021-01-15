exports.up = knex => knex.schema.createTable('alugavel_caracteristica', table => {
    table.integer('caracteristica_id').references('id').inTable('caracteristica').onDelete('CASCADE');
    table.integer('alugavel_id').references('id').inTable('alugavel');
    table.string('valor', 100).notNullable();
    table.primary(['caracteristica_id', 'alugavel_id']);
});

exports.down = knex => knex.schema.dropTable('alugavel_caracteristica');
