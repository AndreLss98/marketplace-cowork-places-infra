const db = require('./../configs/knex');
const TABLE = 'tipo';

const { ALUGAVEL_STATUS } = require('./../shared/constants');

module.exports = {
    async getAll(filters = {}) {
        if (filters.used) {
            return await db(TABLE).whereIn('id', function () {
                this.select('tipo_id').from('alugavel').where({ status: ALUGAVEL_STATUS.APPROVED });
            }).orderBy('id', 'asc');
        }
        return await db(TABLE).orderBy('id', 'asc');
    },
    async getById(id) {
        return await db(TABLE).where({ id }).first();
    },
    async save(tipo) {
        try {
            const id = await db(TABLE).insert(tipo).returning('id');
            return await db(TABLE).where({ id: id[0] }).first();
        } catch(error) {
            throw error
        }
    },
    async update(id, tipo) {
        try {
            return await db(TABLE).where({ id }).update(tipo);
        } catch (error) {
            throw error;
        }
    },
    async delete(id) {
        try {
            return await db(TABLE).where({ id }).delete();
        } catch (error) {
            throw error
        }
    }
}