const db = require('../configs/knex');

const BANK_TABLE = 'banco';
const TABLE = 'conta_bancaria';
const USER_TABLE = 'usuario';

async function getBankName(account) {
    const { nome } = await db.select('nome').from(BANK_TABLE).where({ codigo: account.codigo_banco }).first();
    account.banco = nome;
    return account;
}

module.exports = {
    async getById(id) {
        let account = await db(TABLE).where({ id }).first();
        if (account) return await getBankName(account);
        return account;
    },
    async save(user_id, conta_bancaria) {
        try {
            const id = await db(TABLE).insert(conta_bancaria).returning('id');
            await db(USER_TABLE).update({ conta_bancaria_id: id[0] }).where({ id: user_id });
            let account = await db(TABLE).where({ id: id[0] }).first();
            return await getBankName(account);
        } catch (error) {
            throw error;
        }
    },
    async update(usuario_id, conta_bancaria) {
        try {
            await db(TABLE).update(conta_bancaria).where({ usuario_id });;
            let account = await db(TABLE).where({ usuario_id }).first();
            return await getBankName(account);
        } catch (error) {
            throw error;
        }
    }
}