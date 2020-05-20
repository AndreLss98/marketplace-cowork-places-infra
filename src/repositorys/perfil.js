const db = require('./../configs/knex');
const TABLE = 'perfil';

module.exports = {
    async getAll() {
        return await db(TABLE);
    },
    async search(perfil) {
        return await db(TABLE).where(perfil);
    },
    async save(perfil) {
        try {
            const id = await db(TABLE).insert(perfil).returning('id');
            return await db(TABLE).where({ id: id[0] }).first();
        } catch(error) {
            throw error;
        }
    }
}