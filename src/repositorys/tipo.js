const db = require('./../configs/knex');
const TABLE = 'tipo';
const RELATION_TABLE_DOCUMENTO = 'tipo_alugavel_documento_tipo';
const RELATION_TABLE_CARACTERISTICA = 'tipo_caracteristicas';

const TIPO_ALUGAVEL_DOCUMENTO = require('./../repositorys/tipo_alugavel_documento');

const { ALUGAVEL_STATUS } = require('./../shared/constants');

async function getMoreDetails(tipo) {
    let caracteristicas = await db.select('caracteristica_id').from(RELATION_TABLE_CARACTERISTICA).where({ tipo_id: tipo.id });
    let documentos = await db.select('tipo_alugavel_documento_id').from(RELATION_TABLE_DOCUMENTO).where({ tipo_id: tipo.id });
    tipo.caracteristicas = caracteristicas.map(caracteristica => caracteristica.caracteristica_id);
    tipo.documentos = documentos.map(doc => doc.tipo_alugavel_documento_id);
    return tipo;
}

module.exports = {
    async getAll(filters = {}) {
        let tipos;
        if (filters.used) {
            tipos = await db(TABLE).whereIn('id', function () {
                this.select('tipo_id').from('alugavel').where({ status: ALUGAVEL_STATUS.APPROVED });
            }).orderBy('id', 'asc');
        }
        tipos = await db(TABLE).orderBy('id', 'asc');

        for (let tipo of tipos) {
            tipo = await getMoreDetails(tipo);
        }

        return tipos;
    },
    async getAllCaracteristicas(id) {
        return await db(RELATION_TABLE_CARACTERISTICA).where({ tipo_id: id });
    },
    async getById(id) {
        return await db(TABLE).where({ id }).first();
    },
    async save(tipo) {
        const { caracteristicas, documentos } = tipo;
        delete tipo.caracteristicas;
        delete tipo.documentos;

        try {
            const id = await db(TABLE).insert(tipo).returning('id');
            if (caracteristicas && caracteristicas.length) {
                for (let caracteristica of caracteristicas) {
                    await db(RELATION_TABLE_CARACTERISTICA).insert({ tipo_id: id[0], caracteristica_id: caracteristica });
                }
            }

            if (documentos && documentos.length) {
                for (let documento of documentos) {
                    await db(RELATION_TABLE_DOCUMENTO).insert({ tipo_id: id[0], tipo_alugavel_documento_id: documento });
                }
            }
            return await db(TABLE).where({ id: id[0] }).first();
        } catch(error) {
            throw error
        }
    },
    async update(id, tipo) {
        const { caracteristicas, documentos } = tipo;
        delete tipo.documentos;
        delete tipo.caracteristicas;

        const oldCaracteristicas = (await db(RELATION_TABLE_CARACTERISTICA).where({ tipo_id: id })).map(element => element.caracteristica_id);
        
        const forDelete = oldCaracteristicas
            .filter(caracteristica => !caracteristicas.includes(caracteristica));

        const forInsert = caracteristicas
            .filter(caracteristica => !oldCaracteristicas.includes(caracteristica))

        for (let deleteId of forDelete) {
            await db(RELATION_TABLE_CARACTERISTICA).where({ tipo_id: id, caracteristica_id: deleteId }).delete();
        }

        for (let insertId of forInsert) {
            await db(RELATION_TABLE_CARACTERISTICA).insert({ tipo_id: id, caracteristica_id: insertId });
        }

        try {
            await TIPO_ALUGAVEL_DOCUMENTO.relacionar(id, documentos);
            return await db(TABLE).where({ id }).update(tipo);
        } catch (error) {
            throw error;
        }
    },
    async delete(id) {
        try {
            return await db(TABLE).where({ id }).delete();
        } catch (error) {
            throw error
        }
    }
}