const db = require('./../../configs/knex');
const AlugavelCaracteristica = require('./../repositorys/alugavel_caracteristica');
const TABLE = 'alugavel';

module.exports = {
    async getAll() {
        return await db(TABLE);
    },
    async getById(id) {
        return await db(TABLE).where({ id }).first();
    },
    async save(alugavel, caracteristicas) {
        try {
            const id = await db(TABLE).insert(alugavel).returning('id');
            caracteristicas.forEach(async (caracteristica) => {
                await AlugavelCaracteristica.realacionar(id[0], caracteristica.id, caracteristica.valor);
            });
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