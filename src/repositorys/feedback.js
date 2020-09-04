const db = require('./../configs/knex');

const TipoCampo = require('./tipo_campo');

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
        const feedbacks = await db(TABLE);
        for (let feedback of feedbacks) {
            if (!feedback.fixa && relations.find(relation => relation.feedback_id === feedback.id)) {
                feedback.resposta = relations.find(relation => relation.feedback_id === feedback.id).resposta;
            }
            feedback.campo = await getMoreDetails(feedback.tipo_campo_id);
            delete feedback.tipo_campo_id;
        }
        return feedbacks;
    },
    async getAllByUsers() {
        const users_ids = await db.select('usuario_id').from(RELATION_TABLE).groupBy('usuario_id');
        let users = [];
        for (let user of users_ids) {
            let moreInfoOfUser = await db.column('nome', 'sobrenome', 'img_perfil').select().from('usuario').where({ id: user.usuario_id }).first();
            user = { ...user, ...moreInfoOfUser };
            const perguntas_temp = await db.column('feedback_id', 'resposta').select().from(RELATION_TABLE).where({ usuario_id: user.usuario_id });
            let perguntas = [];
            for (let pergunta of perguntas_temp) {
                let temp = await db.column('pergunta').select().from(TABLE).where({ id: pergunta.feedback_id }).first();
                pergunta = { ...pergunta, ...temp };
                delete pergunta.feedback_id;
                perguntas.push(pergunta);
            }
            user.perguntas = perguntas;
            users.push(user);
        }
        
        return users;
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