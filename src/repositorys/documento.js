const db = require('../configs/knex');

const TABLE = 'documento';
const RELATION_TABLE = 'usuario_documento';

module.exports = {
    async getAll() {
        return await db(TABLE);
    },
    async getById(id) {
        return await db(TABLE).where({ id }).first();
    },
    async save(documento) {
        try {
            const id = await db(TABLE).insert(documento).returning('id');
            return await db(TABLE).where({ id: id[0] }).first();
        } catch(error) {
            throw error;
        }
    },
    async update(id, documento) {
        try {
            return await db(TABLE).update(documento).where({ id });
        } catch(error) {
            throw error;
        }
    },
    async salvarDocumento(documento) {
        try {
            await db(RELATION_TABLE).insert(documento);
            return await db(RELATION_TABLE).where({ url: documento.url }).first();
        } catch(error) {
            throw error;
        }
    }
}