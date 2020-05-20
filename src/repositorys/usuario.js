const bcrypt = require('bcryptjs');
const db = require('./../configs/knex');
const TABLE = 'usuario';

module.exports = {
    async getAll() {
        return await db(TABLE);
    },
    async getById(id) {
        return user = await db(TABLE).where({ id }).first();
    },
    async getByEmail(email) {
        return user = await db(TABLE).where({ email }).first();
    },
    async getByGoogleId(google_id) {
        return user = await db(TABLE).where({ google_id }).first();
    },
    async save(user) {
        if (user.senha) {
            const hash = await bcrypt.hash(user.senha, 10);
            user.senha = hash;
        }
        try {
            const id = await db(TABLE).insert(user).returning('id');
            return await db(TABLE).where({ id: id[0] }).first();
        } catch (error) {
            throw new Error("Registration Failed");
        }
    },
    async update(id, user) {
        return await db(TABLE).update(user).where({ id });
    },
    async atualizarSaldo(id, deposito) {
        let { saldo } = await db.select('saldo').from(TABLE).where({ id }).first();
        saldo = parseFloat(saldo);
        saldo += deposito;
        console.log(saldo);
        return await db(TABLE).update({ saldo }).where({ id });
    }
}

