const db = require('./../configs/knex');

const TABLE = 'documentos_alugavel';

module.exports = {
    async getAllByAlugavelId(alugavel_id) {
        return await db(TABLE).where({ alugavel_id });
    },
    async save(documento) {
        try {
            await db(TABLE).insert(documento);
            return await db(TABLE).where({ url: documento.url });
        } catch(error) {
            throw error;
        }
    }
}