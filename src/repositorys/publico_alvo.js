const db = require('./../configs/knex');

const TABLE = 'publico_alvo';

async function getAll() {
    return await db(TABLE);
}

async function save(publico_alvo) {
    try {
        const id = await db(TABLE).insert(publico_alvo).returning('id');
        return db(TABLE).where({ id: id[0] }).first();
    } catch (error) {
        throw error;
    }
}

async function update(id, publico_alvo) {
    try {
        return await db(TABLE).update(publico_alvo).where({ id });
    } catch (error) {
        throw error;
    }
}

async function del(id) {
    try {
        return await db(TABLE).delete().where({ id });
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAll,
    save, del, update
}