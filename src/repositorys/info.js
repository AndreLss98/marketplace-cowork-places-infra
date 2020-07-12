const db = require('./../configs/knex');
const TABLE = 'info';

module.exports = {
    async getAll(alugavel_id) {
        return await db(TABLE).where({ alugavel_id });
    },
    async save(info) {
        const id = await db(TABLE).insert(info).returning('id');
        return await db(TABLE).where({ id: id[0] }).first();
    },
    async update(info) {
        return await db(TABLE).update({ descricao: info.descricao }).where({ id: info.id });
    },
    async delete(id) {
        return await db(TABLE).where({ id }).delete();
    }
}