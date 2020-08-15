const db = require('./../configs/knex');
const TABLE = 'dias_reservados';

module.exports = {
    async getAllByAlugavelId(alugavel_id) {
        return db.select(`${TABLE}.*`).from(`${TABLE}`)
        .leftJoin('aluguel', `${TABLE}.aluguel_id`, 'aluguel.id')
        .where(`${TABLE}.alugavel_id`, alugavel_id)
        .whereNotNull('aluguel.paypal_order_id')
        .orWhereNotNull('aluguel.subscription_id')
        .orWhereNull(`${TABLE}.aluguel_id`);
    },
    async save(dia) {
        try {
            return await db(TABLE).insert(dia);
        } catch(error) {
            throw error;
        }
    },
    async getLastDateOfRent(alugavel_id) {
        return await db(TABLE).max('data_saida', { as: 'data_saida' }).where({ alugavel_id }).first();
    },
    async getByAluguelId(aluguel_id) {
        return await db(TABLE).where({ aluguel_id }).first();
    }
}