const db = require('../configs/knex');
const TABLE = 'conta_bancaria';

module.exports = {
    async getByUserId(usuario_id) {
        return await db(TABLE).where({ usuario_id }).first();
    },
    async save(conta_bancaria) {
        try {
            await db(TABLE).insert(conta_bancaria);
            return await db(TABLE).where({ usuario_id: conta_bancaria.usuario_id }).first();
        } catch (error) {
            throw error;
        }
    },
    async update(usuario_id, conta_bancaria) {
        try {
            await db(TABLE).update(conta_bancaria).where({ usuario_id });;
            return await db(TABLE).where({ usuario_id }).first();
        } catch (error) {
            throw error;
        }
    }
}