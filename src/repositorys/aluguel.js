const db = require('./../configs/knex');
const TABLE = 'aluguel';

const DiasReservados = require('./dias_reservados');

async function getMoreDetails(aluguel) {
    aluguel.dias_reservados = await DiasReservados.getByAluguelId(aluguel.id);
    return aluguel;
}

module.exports = {
    async getAll(filters = {}) {
        let alugueis = await db(TABLE).where(filters);
        for (let aluguel of alugueis) {
            aluguel = await getMoreDetails(aluguel);
        }
        return alugueis;
    },
    async getById(id) {
        let aluguel = await db(TABLE).where({ id }).first();
        if (!aluguel) return aluguel;
        return await getMoreDetails(aluguel);
    },
    async getAllByUsuarioId(usuario_id) {
        let alugueis = await db(TABLE).where({ usuario_id }).orderBy('data_criacao');
        for (let aluguel of alugueis) {
            aluguel = await getMoreDetails(aluguel);
        }
        return alugueis;
    },
    async getAllAlocacoesByUsuarioId(anunciante_id) {
        let alugueis = await db.select(`${TABLE}.*`).from(TABLE)
            .innerJoin('dias_reservados', 'dias_reservados.aluguel_id', `${TABLE}.id`)
            .innerJoin('alugavel', 'alugavel.id', `dias_reservados.alugavel_id`)
            .where(`alugavel.anunciante_id`, anunciante_id).orderBy(`dias_reservados.data_entrada`, 'desc');
            
        for (let aluguel of alugueis) {
            aluguel = await getMoreDetails(aluguel);
        }
        return alugueis;
    },
    async getAllByAlugavelId(alugavel_id) {
        return await db(TABLE).where({ alugavel_id });
    },
    async save(aluguel) {
        const id = await db(TABLE).insert(aluguel).returning('id');
        return await db(TABLE).where({ id: id[0] }).first();
    },
    async update(id, aluguel) {
        return await db(TABLE).update(aluguel).where({ id });
    }
}