const db = require('./../configs/knex');
const TABLE = 'dias_reservados';

module.exports = {
    async getAllByAlugavelId(alugavel_id) {
        const today = new Date();

        return await db(TABLE)
            .where({ alugavel_id })
            .where('mes', '>=', today.getMonth())
            .where('ano', '>=', today.getFullYear())
            .orWhere('ano', '>', today.getFullYear());
    },
    async save(dia) {
        try {
            return await db(TABLE).insert(dia);
        } catch(error) {
            throw error;
        }
    }
}