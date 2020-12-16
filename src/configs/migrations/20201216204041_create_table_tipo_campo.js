exports.up = knex => knex.schema.createTable('tipo_campo', table => {
    table.increments('id').notNullable().primary();
    table.integer('selecao').references('id').inTable('campo_selecao');
    table.integer('binario').references('id').inTable('campo_binario');
    table.integer('area_texto').references('id').inTable('campo_area_texto');
    table.integer('intervalo').references('id').inTable('campo_intervalo');
    table.integer('numerico').references('id').inTable('campo_numerico');
    table.integer('texto_simples').references('id').inTable('campo_texto_simples');
});

exports.down = knex => knex.schema.dropTable('tipo_campo');
