const db = require('./../configs/knex');
const TABLE = 'politicas';

module.exports = {
    async getAll() {
        return await db(TABLE);
    },
    async getById(id) {
        return await db(TABLE).where({ id });
    },
    async search(politica) {
        return await db(TABLE).where(politica);
    },
    async save(politica) {
        try {
            const id = await db(TABLE).insert({ ...politica, versao: "1.0.0"}).returning('id');
            return await db(TABLE).where({ id: id[0] }).first();
        } catch(error) {
            throw error;
        }
    },
    async update(id, politica) {
        console.log('Politica: ', politica);
        try {
            const response = await db(TABLE).update(politica).where({ id });
            return response
        } catch(error) {
            throw error;
        }
    },
    async delete(id) {
        return db(TABLE).where({ id }).delete();
    }
};