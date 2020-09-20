const db = require('./../configs/knex');
const TABLE = 'tipo';
const RELATION_TABLE_CARACTERISTICA = 'tipo_caracteristicas';

const { ALUGAVEL_STATUS } = require('./../shared/constants');

async function getMoreDetails(tipo) {
    let caracteristicas = await db.select('caracteristica_id').from('tipo_caracteristicas').where({ tipo_id: tipo.id });
    tipo.caracteristicas = caracteristicas.map(caracteristica => caracteristica.caracteristica_id);
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
        const { caracteristicas } = tipo;
        delete tipo.caracteristicas;

        try {
            const id = await db(TABLE).insert(tipo).returning('id');
            if (caracteristicas && caracteristicas.length) {
                for (let caracteristica of caracteristicas) {
                    await db(RELATION_TABLE_CARACTERISTICA).insert({ tipo_id: id[0], caracteristica_id: caracteristica });
                }
            }
            return await db(TABLE).where({ id: id[0] }).first();
        } catch(error) {
            throw error
        }
    },
    async update(id, tipo) {
        const { caracteristicas } = tipo;
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