const db = require('./../configs/knex');
const TABLE = 'condicoes';

module.exports = {
    async getAll() {
        return await db(TABLE);
    },
    async getById(id) {
        return await db(TABLE).where({ id }).first();
    },
    async save(condicao) {
        const id = await db(TABLE).insert(condicao).returning('id');
        return await db(TABLE).where({ id: id[0] }).first();
    },
    async update(id, condicao) {
        return await db(TABLE).update(condicao).where({ id });
    }
};