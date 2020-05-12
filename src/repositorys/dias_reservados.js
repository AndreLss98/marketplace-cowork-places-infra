const db = require('./../../configs/knex');
const TABLE = 'dias_reservados';

module.exports = {
    async getAllByAlugavelId(alugavel_id) {
        const today = new Date();
        return await db(TABLE)
            .where({ alugavel_id })
            .where('dia', '>=', today.getDate())
            .where('mes', '>=', today.getMonth() + 1)
            .where('ano', '>=', today.getFullYear());
    },
    async save(dia) {
        try {
            return await db(TABLE).insert(dia);
        } catch(error) {
            throw error;
        }
    }
}