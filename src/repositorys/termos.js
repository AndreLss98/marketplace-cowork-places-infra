const db = require('./../configs/knex');
const TABLE = 'termos';

module.exports = {
    async getByUserId(usuario_id) {
        return await db(TABLE).where({ usuario_id }).first();
    },
    async save(assinatura) {
        await db(TABLE).insert(assinatura).returning('usuario_id');
        return await db(TABLE).where({ usuario_id: assinatura.usuario_id }).first();
    },
    async update(usuario_id, versao) {
        return await db(TABLE).update({ versao }).where({ usuario_id });
    }
}