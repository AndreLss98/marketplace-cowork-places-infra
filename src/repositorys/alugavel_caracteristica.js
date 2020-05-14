const db = require('./../configs/knex');
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
    },
    async atualizarValor(alugavel_id, caracteristica_id, valor) {
        return await db(TABLE).update({ valor }).where({ alugavel_id, caracteristica_id });
    },
    async getAllCaracteristicas(alugavel_id) {
        return await db(TABLE).where({ alugavel_id });
    }
}