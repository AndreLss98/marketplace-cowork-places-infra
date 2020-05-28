const db = require('./../configs/knex');
const TABLE = 'termos';

module.exports = {
    async getByUserId(usuario_id) {
        return await db(TABLE).where({ usuario_id }).first();
    },
    async save(usuario_id, versao) {
        await db(TABLE).insert({ usuario_id, aceito: true, versao }).returning('usuario_id');
        return await db(TABLE).where({ usuario_id }).first();
    },
    async update(usuario_id, versao) {
        return await db(TABLE).update({ versao }).where({ usuario_id });
    }
}