const db = require('./../../configs/knex');
const TABLE = 'alugavel';

module.exports = {
    async getAll() {
        return await db(TABLE);
    },
    async getById(id) {
        return await db(TABLE).where({ id }).first();
    },
    async save(alugavel) {
        try {
            const id = await db(TABLE).insert(alugavel).returning('id');
            return await db(TABLE).where({ id: id[0] }).first();
        } catch(error) {
            throw "Registration failed";
        }
    },
    async update(alugavel) {
        try {
            return await db(TABLE).update(alugavel).where({ id: alugavel.id });
        } catch (error) {
            throw error;
        }
    }
}