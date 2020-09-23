const { update } = require('./../configs/knex');
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

const POSSIBILIDADES_TABLE = 'possibilidade_campo_selecao';

module.exports = {
    async save(tipo_campo) {
        try {
            let { propriedades } = tipo_campo;  
            let { possibilidades } = propriedades;
            delete propriedades.possibilidades;

            const type_id = await db(TYPES_TABLES[tipo_campo.tipo]).insert(propriedades).returning('id');
            const id = await db(TABLE).insert(JSON.parse(`{"${tipo_campo.tipo}": ${type_id[0]}}`)).returning('id');

            if (tipo_campo.tipo === 'selecao' && possibilidades && possibilidades.length) {
                for (let possibilidade of possibilidades) {
                    possibilidade.campo_selecao_id = type_id[0];
                    await db(POSSIBILIDADES_TABLE).insert(possibilidade);
                }
            }

            return await db(TABLE).where({ id: id[0] }).first();
        } catch (error) {
            throw error;
        }
    },
    async update(tipo_campo) {
        let { propriedades } = tipo_campo;
        let { possibilidades } = propriedades;
        delete propriedades.possibilidades;

        try {
            if (tipo_campo.tipo === 'selecao' && possibilidades && possibilidades.length) {
                for (let possibilidade of possibilidades) {
                    if (!possibilidade.id) {
                        possibilidade.campo_selecao_id = propriedades.id;
                        await db(POSSIBILIDADES_TABLE).insert(possibilidade);
                    }
                }
            }

            return await db(TYPES_TABLES[tipo_campo.tipo]).where({ id: propriedades.id }).update(propriedades);
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
            
            tipo_campo = {
                id,
                tipo,
                propriedades: await db(TYPES_TABLES[tipo]).where({ id: tipo_campo[tipo] }).first()
            };

            if (tipo_campo.tipo === 'selecao') tipo_campo.propriedades.possibilidades = await db.select(['id', 'valor']).from(POSSIBILIDADES_TABLE).where({ campo_selecao_id: tipo_campo.propriedades.id });
            return tipo_campo;
        } catch (error) {
            throw error;
        }
    },
    async delete(id) {
        try {
            let tipo_campo = await db(TABLE).where({ id }).first();
            if (!tipo_campo) return null;
            delete tipo_campo.id;
            console.log(tipo_campo);
            const tipo = Object.keys(tipo_campo).find(campo => {
                if (tipo_campo[campo]) return campo;
            });
            await db(TABLE).where({ id }).delete();
            
            if (tipo === 'selecao') await db(POSSIBILIDADES_TABLE).where({ campo_selecao_id: tipo_campo[tipo] }).delete();
            await db(TYPES_TABLES[tipo]).where({ id: tipo_campo[tipo] }).delete();
        } catch (error) {
            throw error;
        }
    },
    async deletePossibilidade(id) {
        return await db(POSSIBILIDADES_TABLE).where({ id }).delete();
    }
}