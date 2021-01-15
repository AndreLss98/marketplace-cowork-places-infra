exports.up = knex => knex.schema.createTable('local', table => {
    table.integer('numero');
    table.string('bairro', 200);
    table.string('complemento', 200);
    table.string('cep', 10).notNullable();
    table.string('rua', 200).notNullable();
    table.string('pais', 200).notNullable();
    table.string('cidade', 200).notNullable();
    table.string('estado', 200).notNullable();
    table.specificType('latitude', 'double precision').notNullable();
    table.specificType('longitude', 'double precision').notNullable();
    table.integer('alugavel_id').references('id').inTable('alugavel').notNullable();
});

exports.down = knex => knex.schema.dropTable('local');