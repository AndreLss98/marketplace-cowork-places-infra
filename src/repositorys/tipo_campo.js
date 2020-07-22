const db = require('./../configs/knex');

const TABLE = 'tipo_campo';
const TYPES_TABLES = {
    selecao: 'campo_selecao',
    binario: 'campo_binario',
    area_texto: 'campo_area_texto',
    intervalo: 'campo_intervalo',
    numerico: 'campo_numerico',
    texto_simples: 'campo_texto_simples'
}

module.exports = {
    async save(tipo_campo) {
        try {
            const type_id = await db(TYPES_TABLES[tipo_campo.tipo]).insert(tipo_campo.propriedades).returning('id');
            const id = await db(TABLE).insert(JSON.parse(`{"${tipo_campo.tipo}": ${type_id[0]}}`)).returning('id');
            return await db(TABLE).where({ id: id[0] }).first();
        } catch (error) {
            throw error;
        }
    },
    async getOne(id) {
        try {
            let tipo_campo = await db(TABLE).where({ id }).first();
            if (!tipo_campo) return null;
            delete tipo_campo.id;

            const tipo = Object.keys(tipo_campo).find(campo => {
                if (tipo_campo[campo]) return campo;
            });
    
            const propriedades = await db(TYPES_TABLES[tipo]).where({ id: tipo_campo[tipo] }).first();
        
            return { id, tipo, propriedades };
        } catch (error) {
            throw error;
        }
    },
    async delete(id) {
        try {
            let tipo_campo = await db(TABLE).where({ id }).first();
            if (!tipo_campo) return null;

            const tipo = Object.keys(tipo_campo).find(campo => {
                if (tipo_campo[campo]) return campo;
            });
    
            await db(TYPES_TABLES[tipo]).where({ id: tipo_campo[tipo] }).delete();
            return await db(TABLE).where({ id }).delete();
        } catch (error) {
            throw error;
        }
    }
}