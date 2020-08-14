const db = require('./../configs/knex');
const { table } = require('./../configs/knex');
const TABLE = 'aluguel';

module.exports = {
    async getAllByUsuarioId(usuario_id) {
        return await db(TABLE).innerJoin('dias_reservados', 'dias_reservados.aluguel_id', `${TABLE}.id`).where(`${TABLE}.usuario_id`, usuario_id);
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