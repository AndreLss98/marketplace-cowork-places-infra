const db = require('./../configs/knex');
const TABLE = 'caracteristica';

const TipoCampo = require('./tipo_campo');

async function getMoreDetails(tipo_campo_id) {
    return await TipoCampo.getOne(tipo_campo_id);
}

module.exports = {
    async getAll() {
        let caracteristicas = await db(TABLE).orderBy('id', 'asc');
        for (let caracteristica of caracteristicas) {
            caracteristica.tipo_campo = await getMoreDetails(caracteristica.tipo_campo_id);
        }
        return caracteristicas;
    }, 
    async getById(id) {
        let caracteristica = await db(TABLE).where({ id }).first();
        caracteristica.tipo_campo = await getMoreDetails(caracteristica.tipo_campo_id);
        return caracteristica;
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
        let { tipo_campo } = caracteristica;
        delete caracteristica.tipo_campo;
        
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