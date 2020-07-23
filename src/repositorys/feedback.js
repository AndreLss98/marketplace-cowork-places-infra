const db = require('./../configs/knex');

const TipoCampo = require('./tipo_campo');
const { table } = require('./../configs/knex');

const  TABLE = 'feedback';
const  RELATION_TABLE = 'feedback_usuario';

async function getMoreDetails(tipo_campo_id) {
    return await TipoCampo.getOne(tipo_campo_id);
}

module.exports = {
    async getAll() {
        let feedbacks = await db(TABLE);
        for (let feedback of feedbacks) {
            feedback.campo = await getMoreDetails(feedback.tipo_campo_id);
            delete feedback.tipo_campo_id;
        }
        return feedbacks;
    },
    async getAllByUser(usuario_id) {
        const relations = await db(RELATION_TABLE).where({ usuario_id });
        const relationsIds = relations.map(relation => relation.feedback_id);
        const feedbacks = await db(TABLE);
        for (let feedback of feedbacks) {
            if (relations.find(relation => relation.feedback_id === feedback.id)) {
                feedback.resposta = relations.find(relation => relation.feedback_id === feedback.id).resposta;
            }
            feedback.campo = await getMoreDetails(feedback.tipo_campo_id);
            delete feedback.tipo_campo_id;
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
        let { tipo_campo } = feedback;
        delete feedback.tipo_campo;
        tipo_campo = await TipoCampo.save(tipo_campo);
        feedback.tipo_campo_id = tipo_campo.id;

        const id = await db(TABLE).insert(feedback).returning('id');
        return await db(TABLE).where({ id: id[0] }).first();
    },
    async update(id, feedback) {
        return await db(TABLE).update(feedback).where({ id });
    },
    async delete(id) {
        const feedback = await db(TABLE).where({id}).first();
        await db(TABLE).where({ id }).delete();
        return await TipoCampo.delete(feedback.tipo_campo_id);
    }
}