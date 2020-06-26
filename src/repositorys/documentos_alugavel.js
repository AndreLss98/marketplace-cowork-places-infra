const db = require('./../configs/knex');

const TABLE = 'documentos_alugavel';

module.exports = {
    async getAllByAlugavelId(alugavel_id) {
        return await db(TABLE).where({ alugavel_id });
    },
    async save(documento) {
        try {
            const id = await db(TABLE).insert(documento).returning('id');
            return await db(TABLE).where({ id: id[0] }).first();
        } catch(error) {
            throw error;
        }
    },
    async relacionar(alugavel_id, documentos) {
        for (let id of documentos) {
            await db(TABLE).update({ alugavel_id }).where({ id });
        }
    }
}