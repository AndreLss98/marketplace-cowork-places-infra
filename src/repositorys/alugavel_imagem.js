const db = require('./../configs/knex');
const TABLE = 'alugavel_imagem';

const sharedFunction = require('./../shared/functions');

module.exports = {
    async save(url) {
        const id = await db(TABLE).insert({ url }).returning('id');
        const img = await db(TABLE).where({ id: id[0] }).first();
        return img;
    },
    async relacionar(alugavel_id, imagens) {
        for (let id of imagens) {
            await db(TABLE).update({ alugavel_id }).where({ id });
        }
    },
    async delete(id) {
        const img = await db(TABLE).where({ id }).first();
        await sharedFunction.deleteFile('img', img.url.substr(img.url.lastIndexOf('/') + 1));
        return await db(TABLE).where({ id }).delete();
    },
    async getAllByAlugavelId(alugavel_id) {
        return await db(TABLE).where({ alugavel_id });
    },
    async getOneByAlugavelId(alugavel_id) {
        return await db(TABLE).where({ alugavel_id }).limit(1).first();
    }
}