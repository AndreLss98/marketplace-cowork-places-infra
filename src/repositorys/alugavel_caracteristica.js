const db = require('./../../configs/knex');
const TABLE = 'alugavel_caracteristica';

module.exports = {
    async realacionar(alugavel_id, caracteristica_id, valor) {
        try {
            return await db(TABLE).insert({ alugavel_id, caracteristica_id, valor });
        } catch(error) {
            return error;
        }
    },
    async removerRelacionamento(alugavel_id, caracteristica_id) {
        return await db(TABLE).where({ alugavel_id, caracteristica_id }).delete();
    }
}