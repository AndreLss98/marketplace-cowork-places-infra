const db = require('./../configs/knex');
const TABLE = 'local';

const { ALUGAVEL_STATUS } = require('./../shared/constants');

module.exports = {
    async getByAlugavelId(alugavel_id) {
        return await db(TABLE).where({ alugavel_id }).first();
    },
    async save(local, id) {
        local.alugavel_id = id;
        local.numero = local.numero? parseFloat(local.numero) : null;
        return await db(TABLE).insert(local);
    },
    async update(local) {
        local.numero = local.numero? parseFloat(local.numero) : null;
        return await db(TABLE).update(local).where({ alugavel_id: local.alugavel_id });
    },
    async getAllBairros(filters = {}) {
        if (filters.used) return await db.select('bairro').from(TABLE).whereIn('alugavel_id', function() {
            this.select('id').from('alugavel').where({ status: ALUGAVEL_STATUS.APPROVED });
        }).groupBy('bairro').orderBy('bairro', 'asc');
        return await db.select('bairro').from(TABLE).groupBy('bairro').orderBy('bairro', 'asc');
    },
    async getAllCidades(filters = {}) {
        if (filters.used) return await db.select('cidade').from(TABLE).whereIn('alugavel_id', function() {
            this.select('id').from('alugavel').where({ status: ALUGAVEL_STATUS.APPROVED });
        }).groupBy('cidade').orderBy('cidade', 'asc');
        return await db.select('cidade').from(TABLE).groupBy('cidade').orderBy('cidade', 'asc');
    }
}