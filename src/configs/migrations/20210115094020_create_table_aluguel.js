exports.up = knex => knex.schema.createTable('aluguel', table => {
    table.increments('id').notNullable().primary();
    table.string('paypal_order_id', 200);
    table.string('paypal_plan_id', 200);
    table.string('subscription_id', 200);
    table.string('subscription_status', 200);
    table.string('comentario', 250);
    table.integer('nota').notNullable().default(5);
    table.decimal('valor', 10, 2).notNullable();
    table.integer('usuario_id').references('id').inTable('usuario');
    table.integer('alugavel_id').references('id').inTable('alugavel');
    table.string('status', 100).default('created').comment('Values: created, active, canceled');
    table.timestamp('data_criacao').default(knex.fn.now());
    table.boolean('canceled_by_locador');
    table.boolean('checkin').default(false);
});

exports.down = knex => knex.schema.dropTable('aluguel');