exports.up = knex => knex.schema.createTable('alugavel', table => {
    table.increments('id').notNullable().primary();
    table.string('paypal_id', 200),
    table.integer('anunciante_id').notNullable().references('id').inTable('usuario');
    table.integer('tipo_id').notNullable().references('id').inTable('tipo');
    table.string('descricao', 500);
    table.decimal('valor', 10, 2);
    table.decimal('valor_mensal', 10, 2);
    table.string('status', 100).notNullable().default('waiting').comment('Values: waiting, approved, disapproved, removed');
    table.string('titulo', 100).notNullable();
    table.boolean('proprietario').notNullable().default(false);
    table.decimal('taxa', 10, 2).notNullable().default(0);
    table.string('observacao', 500);
    table.integer('qtd_maxima_reservas').notNullable().default(1);
    table.boolean('pessoajuridica').notNullable().default(false);
});

exports.down = knex => knex.schema.dropTable('alugavel');
