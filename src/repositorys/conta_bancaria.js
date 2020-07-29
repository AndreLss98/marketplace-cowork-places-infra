const db = require('../configs/knex');
const TABLE = 'conta_bancaria';
const BANK_TABLE = 'banco';

async function getBankName(account) {
    const { nome } = await db.select('nome').from(BANK_TABLE).where({ codigo: account.codigo_banco }).first();
    account.banco = nome;
    return account;
}

module.exports = {
    async getByUserId(usuario_id) {
        let account = await db(TABLE).where({ usuario_id }).first();
        if (account) return await getBankName(account);
        return account;
    },
    async save(conta_bancaria) {
        try {
            await db(TABLE).insert(conta_bancaria);
            let account = await db(TABLE).where({ usuario_id: conta_bancaria.usuario_id }).first();
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