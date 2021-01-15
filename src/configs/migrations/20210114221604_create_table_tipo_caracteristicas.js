exports.up = knex => knex.schema.createTable('tipo_caracteristica', table => {
    table.integer('tipo_id').references('id').inTable('tipo').onDelete('CASCADE');
    table.integer('caracteristica_id').references('id').inTable('caracteristica').onDelete('CASCADE');
    table.primary(['tipo_id', 'caracteristica_id']);
});

exports.down = knex => knex.schema.dropTable('tipo_caracteristica');