exports.seed = knex => {
  return knex('perfil').del()
    .then(function () {
      return knex('perfil').insert([
        { nivel: 1, nome: 'usuario' },
        { nivel: 2, nome: 'admin' },
        { nivel: 3, nome: 'fotografo' },
      ]);
    });
};
