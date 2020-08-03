const db = require('./../configs/knex');
const TABLE = 'dias_reservados';

module.exports = {
    async getAllByAlugavelId(alugavel_id) {
        return await db.select(`${TABLE}.*`).from(TABLE)
        .leftJoin('aluguel', `${TABLE}.aluguel_id`, 'aluguel.id')
        .whereNull(`${TABLE}.aluguel_id`)
        .orWhereNotNull('aluguel.paypal_order_id')
        .orWhereNotNull('aluguel.subscription_id')
        .andWhere(`${TABLE}.alugavel_id`, alugavel_id);
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
    }
}