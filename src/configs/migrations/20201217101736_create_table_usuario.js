exports.up = knex => knex.schema.createTable('usuario', table => {
    table.increments('id').notNullable().primary();
    table.integer('perfil_id').notNullable().default(1).references('id').inTable('perfil');
    table.string('email', 100).unique().notNullable();
    table.string('senha', 100).default(null);
    table.string('nome', 100).notNullable();
    table.string('sobrenome', 100).notNullable();
    table.date('data_nascimento').default(null);
    table.string('numero_1', 20).default(null);
    table.string('numero_2', 20).default(null);
    table.string('img_perfil', 255).default(null);
    table.string('google_id', 255).default(null);
    table.decimal('saldo', 10, 2).default(0).notNullable();
    table.string('refresh_token', 100);
    table.bigInteger('expires_at').default(0);
    table.string('cpf', 15);
    table.string('status_cadastro', 20).default('waiting').notNullable().comment('Values: waiting, approved, disapproved');
    table.string('email_token', 100);
    table.boolean('email_validado').default(false).notNullable();
    table.text('observacao');
    table.integer('conta_bancaria_id').references('id').inTable('conta_bancaria');
});

exports.down = knex => knex.schema.dropTable('usuario');