const db = require('./../configs/knex');

const TABLE = 'questionario';
const ANSWERS_TABLE = 'questionario_usuario';

module.exports = {
    async getAll() {
        return await db(TABLE).orderBy('id', 'asc');
    },
    async save(pergunta) {
        try {
            const id = await db(TABLE).insert(pergunta).returning('id');
            return await db(TABLE).where({ id: id[0] }).first();
        } catch(error) {
            throw error;
        }
    },
    async update(id, pergunta) {
        try {
            await db(TABLE).update({ pergunta }).where({ id });
            return await db(TABLE).where({ id }).first();
        } catch(error) {
            throw error;
        }
    },
    async delete(id) {
        try {
            await db(ANSWERS_TABLE).delete().where({ pergunta_id: id });
            return await db(TABLE).delete().where({ id });
        } catch(error) {
            throw error;
        }
    },
    async answer(usuario_id, responses) {
        try {
            for (let response of responses ){
                response.usuario_id = usuario_id;
                await db(ANSWERS_TABLE).insert(response);
            }

            return await db(ANSWERS_TABLE).where({ usuario_id });
        } catch(error) {
            throw error;
        }
    },
    async getAllAnswersOfUser(usuario_id) {
        return await db(ANSWERS_TABLE).where({ usuario_id });
    }
}