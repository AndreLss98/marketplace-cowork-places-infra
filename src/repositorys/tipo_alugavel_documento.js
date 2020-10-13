const db = require('../configs/knex');

const TABLE = 'tipo_alugavel_documento';
const RELATION_TABLE = 'tipo_alugavel_documento_tipo';

module.exports = {
    async getAll() {
        return await db(TABLE);
    },
    async save(tipo_documento) {
        try {
            const id = await db(TABLE).insert(tipo_documento).returning('id');
            return await db(TABLE).where({ id: id[0] }).first();
        } catch(error) {
            throw error;
        }
    },
    async update(id, tipo_documento) {
        try {
            return await db(TABLE).update(tipo_documento).where({ id });
        } catch(error) {
            throw error;
        }
    },
    async delete(id) {
        try {
            return await db(TABLE).where({ id }).delete();
        } catch(error) {
            throw error;
        }
    },
    async relacionar(tipo_id, documentos) {
        const old = (await db.select('tipo_alugavel_documento_id').from(RELATION_TABLE).where({ tipo_id }))
            .map(doc => doc.tipo_alugavel_documento_id);

        const news = documentos.filter(doc => !old.includes(doc));
        const remove = old.filter(doc => !documentos.includes(doc));
        try {
            for (let id of news) {
                await db(RELATION_TABLE).insert({ tipo_id, tipo_alugavel_documento_id: id });
            }
    
            for (let id of remove) {
                await db(RELATION_TABLE).where({ tipo_id, tipo_alugavel_documento_id: id }).delete();
            }
        } catch(error) {
            throw error;
        }
    }
}