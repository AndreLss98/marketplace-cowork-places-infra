const db = require('../../configs/knex');
const TABLE = 'local';

module.exports = {
    async getByAlugavelId(alugavel_id) {
        return await db(TABLE).where({ alugavel_id }).first();
    },
    async save(local, id) {
        local.alugavel_id = id;
        return await db(TABLE).insert(local);
    },
    async update(local) {
        return await db(TABLE).update(local).where({ alugavel_id: local.alugavel_id });
    }
}