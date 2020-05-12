const db = require('./../../configs/knex');
const TABLE = 'duvida';

module.exports = {
    async getAllByAlugavelId(alugavel_id) {
        return await db(TABLE).where({ alugavel_id });
    },
    async getAllByUserId(usuario_id) {
        return await db(TABLE).where({ usuario_id });
    },
    async save(duvida) {
        const id = await db(TABLE).insert(duvida).returning('id');
        const temp = await db(TABLE).where({ id: id[0] }).first();
        return temp;
    },
    async update(duvida) {
        return await db(TABLE).update(duvida).where({ id: duvida.id });
    }
}