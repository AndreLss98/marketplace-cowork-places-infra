const db = require('./../configs/knex');
const TABLE = 'favorito';

module.exports = {
    async getAllByUserId(usuario_id) {
        return db.select('alugavel_id').from(TABLE).where({ usuario_id });
    },
    async favoritar(usuario_id, alugavel_id) {
        try {
            await db(TABLE).insert({ usuario_id, alugavel_id });
            return 1;
        } catch (error) {
            throw error;
        }
    },
    async desfavoritar(usuario_id, alugavel_id) {
        return db(TABLE).where({ usuario_id, alugavel_id }).delete();
    }
}