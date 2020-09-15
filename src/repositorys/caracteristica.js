const db = require('./../configs/knex');
const TABLE = 'caracteristica';

const TipoCampo = require('./tipo_campo');

module.exports = {
    async getAll() {
        return db(TABLE).orderBy('id', 'asc');
    }, 
    async getById(id) {
        return db(TABLE).where({ id }).first();
    },
    async save(caracteristica) {
        let { tipo_campo } = caracteristica;
        delete caracteristica.tipo_campo;
        
        try {
            tipo_campo = await TipoCampo.save(tipo_campo);
            caracteristica.tipo_campo_id = tipo_campo.id;
            
            const id = await db(TABLE).insert(caracteristica).returning('id');
            return await db(TABLE).where({ id: id[0] }).first();
        } catch (error) {
            throw  error;
        }
    },
    async update(id, caracteristica) {
        try {
            return await db(TABLE).where({ id }).update(caracteristica);
        } catch(error) {
            throw error;
        }
    },
    async delete(id) {
        try {
            return db(TABLE).where({ id }).delete();
        } catch(error) {
            throw error;
        }
    }
}