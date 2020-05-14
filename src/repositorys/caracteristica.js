const db = require('./../configs/knex');
const TABLE = 'caracteristica';

module.exports = {
    async getAll() {
        return db(TABLE);
    }, 
    async getById(id) {
        return db(TABLE).where({ id }).first();
    },
    async save(caracteristica) {
        try {
            const id = await db(TABLE).insert(caracteristica).returning('id');
            return await db(TABLE).where({ id: id[0] }).first();
        } catch (error) {
            throw  error;
        }
    },
    async update(caracteristica) {
        try {
            return await db(TABLE).where({ id: caracteristica.id }).update(caracteristica);
        } catch(error) {
            throw error;
        }
    },
    async delete(id) {
        return db(TABLE).where({ id }).delete();
    }
}