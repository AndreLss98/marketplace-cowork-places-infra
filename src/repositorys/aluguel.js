const db = require('./../configs/knex');
const { table } = require('./../configs/knex');
const TABLE = 'aluguel';

module.exports = {
    async getAllByUsuarioId(usuario_id) {
        return await db(TABLE)
            .select(`${TABLE}.*`)
            .select('local.*')
            .select('dias_reservados.*')
            .select('usuario.nome as owner_nome', 'usuario.email as owner_email',  'usuario.numero_1 as owner_numero_1', 'usuario.numero_2 as owner_numero_2')
            .innerJoin('dias_reservados', 'dias_reservados.aluguel_id', `${TABLE}.id`).where(`${TABLE}.usuario_id`, usuario_id)
            .innerJoin('local', 'local.alugavel_id', `${TABLE}.alugavel_id`)
            .innerJoin('usuario', 'usuario.id', usuario_id)


    },
    async getAllByAlugavelId(alugavel_id) {
        return await db(TABLE).where({ alugavel_id });
    },
    async save(aluguel) {
        const id = await db(TABLE).insert(aluguel).returning('id');
        return await db(TABLE).where({ id: id[0] }).first();
    },
    async update(id, aluguel) {
        return await db(TABLE).update(aluguel).where({ id });
    }
}