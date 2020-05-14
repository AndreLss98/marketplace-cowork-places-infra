const db = require('./../configs/knex');
const TABLE = 'alugavel';

const Info = require('./../repositorys/info');
const Local = require('./../repositorys/local');
const AlugavelCaracteristica = require('./../repositorys/alugavel_caracteristica');


module.exports = {
    async getAll() {
        return await db(TABLE);
    },
    async getById(id) {
        return await db(TABLE).where({ id }).first();
    },
    async save(alugavel, caracteristicas, infos, local) {
        try {
            const id = await db(TABLE).insert(alugavel).returning('id');
            if (caracteristicas) {
                caracteristicas.forEach(async (caracteristica) => {
                    await AlugavelCaracteristica.realacionar(id[0], caracteristica.id, caracteristica.valor);
                });
            }

            if (infos) {
                infos.forEach(async (info) => {
                    info.alugavel_id = id[0];
                    await Info.save(info);
                });
            }

            await Local.save(local, id[0]);

            return await db(TABLE).where({ id: id[0] }).first();
        } catch(error) {
            throw error;
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