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
    },
    async getAllSendByUser(usuario_id) {
        return await db(RELATION_TABLE).where({ usuario_id }).innerJoin(TABLE, 'usuario_documento.documento_id', 'documento.id');
    },
    async delete(id) {
        await db(RELATION_TABLE).where({ documento_id: id });
        return await db(TABLE).where({ id }).delete();
    }
}