const db = require('./../configs/knex');
const TABLE = 'tipo';

module.exports = {
    async getAll() {
        return await db(TABLE).orderBy('id', 'asc');
    },
    async getById(id) {
        return await db(TABLE).where({ id }).first();
    },
    async save(tipo) {
        try {
            const id = await db(TABLE).insert(tipo).returning('id');
            return await db(TABLE).where({ id: id[0] }).first();
        } catch(error) {
            throw error
        }
    },
    async update(id, tipo) {
        try {
            return await db(TABLE).where({ id }).update(tipo);
        } catch (error) {
            throw error;
        }
    }
}