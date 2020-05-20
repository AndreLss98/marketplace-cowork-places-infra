const db = require('./../configs/knex');

const  TABLE = 'feedback';
const  RELATION_TABLE = 'feedback_usuario';

module.exports = {
    async getAll() {
        return await db(TABLE);
    },
    async getAllByUser(usuario_id) {
        const relations = await db(RELATION_TABLE).where({ usuario_id });
        const relationsIds = relations.map(relation => relation.feedback_id);
        const feedbacks = await db(TABLE).whereIn('id', relationsIds);
        for (let feedback of feedbacks) {
            feedback.resposta = relations.find(relation => relation.feedback_id === feedback.id).resposta;
        }
        return feedbacks;
    },
    async reply(usuario_id, feedbacks) {
        for (let feedback of feedbacks) {
            feedback.usuario_id = usuario_id;
            await db(RELATION_TABLE).insert(feedback);
        }
        return await db(RELATION_TABLE).where({usuario_id});
    },
    async save(feedback) {
        const id = await db(TABLE).insert(feedback).returning('id');
        return await db(TABLE).where({ id: id[0] }).first();
    }
}