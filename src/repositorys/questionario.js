const db = require('./../configs/knex');

const TABLE = 'questionario';
const ANSWERS_TABLE = 'questionario_usuario';

module.exports = {
    async getAll() {
        return await db(TABLE);
    },
    async save(pergunta) {
        try {
            const id = await db(TABLE).insert(pergunta).returning('id');
            return await db(TABLE).where({ id: id[0] }).first();
        } catch(error) {
            throw error;
        }
    },
    async answer(response) {
        try {
            await db(ANSWERS_TABLE).insert({response});
            return await db(ANSWERS_TABLE).where({ usuario_id: response.usuario_id, pergunta_id: response.pergunta_id }).first();
        } catch(error) {
            throw error;
        }
    },
    async getAllAnswersOfUser(usuario_id) {
        return await db(ANSWERS_TABLE).where({ usuario_id });
    }
}