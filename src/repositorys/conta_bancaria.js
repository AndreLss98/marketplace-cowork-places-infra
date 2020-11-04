const db = require('../configs/knex');

const BANK_TABLE = 'banco';
const TABLE = 'conta_bancaria';
const USER_TABLE = 'usuario';
const USER_JURIDIC_TABLE = 'pessoa_juridica';

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
    async save(account_id, conta_bancaria, pessoajuridica) {
        try {
            const id = await db(TABLE).insert(conta_bancaria).returning('id');
            !pessoajuridica? await db(USER_TABLE).update({ conta_bancaria_id: id[0] }).where({ id: account_id }) :
                await db(USER_JURIDIC_TABLE).update({ conta_bancaria_id: id[0] }).where({ id: account_id });

            let account = await db(TABLE).where({ id: id[0] }).first();
            return await getBankName(account);
        } catch (error) {
            throw error;
        }
    },
    async update(conta_bancaria) {
        try {
            await db(TABLE).update(conta_bancaria).where({ id: conta_bancaria.id });;
            let account = await db(TABLE).where({ id: conta_bancaria.id }).first();
            return await getBankName(account);
        } catch (error) {
            throw error;
        }
    }
}