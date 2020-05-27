const db = require('./../configs/knex');
const TABLE = 'aluguel';

module.exports = {
    async getAllByUsuarioId(usuario_id) {
        return await db(TABLE).where({ usuario_id });
    },
    async getAllByAlugavelId(alugavel_id) {
        return await db(TABLE).where({ alugavel_id });
    },
    async save(aluguel) {
        const id = await db(TABLE).insert(aluguel).returning('id');
        return await db(TABLE).where({ id: id[0] }).first();
    }
}