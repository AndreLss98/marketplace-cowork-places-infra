const db = require('./../../configs/knex');
const TABLE = 'alugavel_imagem';

module.exports = {
    async save(alugavel_id, url) {
        const id = await db(TABLE).insert({ alugavel_id, url }).returning('id');
        const img = await db(TABLE).where({ id: id[0] }).first();
        return img;
    },
    async delete(id) {
        return await db(TABLE).where({ id }).delete();
    }
}