const db = require('./../configs/knex');
const  TABLE = 'feedback';
const  RELATION_TABLE = 'feedback_usuario';
module.exports = {
    async getAll() {
        return await db(TABLE);
    },
    async getAllByUser(usuario_id) {
        const relations = await db(RELATION_TABLE).where({ usuario_id });
        const relationsIds = relations.map(relation => relation.usuario_id);
        const feedbacks = await db(TABLE).whereIn('id', relationsIds);
        console.log(feedbacks);
    },
    async save(feedback) {
        const id = await db(TABLE).insert(feedback).returning('id');
        return await db(TABLE).where({ id: id[0] }).first();
    }
}