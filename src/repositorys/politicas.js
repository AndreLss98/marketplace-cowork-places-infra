const db = require('./../configs/knex');
const sharedFunctions = require('./../shared/functions');

const TABLE = 'politicas';

module.exports = {
    async getAll() {
        return await db(TABLE).orderBy('id', "asc");
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
        try {
            return await db(TABLE).update(politica).where({ id });
        } catch(error) {
            throw error;
        }
    },
    async delete(id) {
        const politica = await db(TABLE).where({ id }).first();
        await sharedFunctions.deleteFile('md', politica.url.substr(politica.url.lastIndexOf('/') + 1));
        return db(TABLE).where({ id }).delete();
    }
};