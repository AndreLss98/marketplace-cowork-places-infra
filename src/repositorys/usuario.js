const bcrypt = require('bcryptjs');
const db = require('./../configs/knex');
const perfis = require('./../shared/perfis');

const TABLE = 'usuario';
const TABLE_ADDRESS = 'endereco';
const TABLE_JURIDIC = 'pessoa_juridica';

module.exports = {
    async getAll(filters = { }) {
        return await db(TABLE).where(filters);
    },
    async getById(id) {
        return await db(TABLE).where({ id }).first();
    },
    async getByEmail(email) {
        return await db(TABLE).where({ email }).first();
    },
    async getByCpf(cpf) {
        return await db(TABLE).where({ cpf }).first();
    },
    async getByGoogleId(google_id) {
        return await db(TABLE).where({ google_id }).first();
    },
    async getBySearchKey(search_key, keys = ['*']) {
        return await db.column(keys).from(TABLE).where(search_key).first();
    },
    async getAllAdmin() {
        return await db(TABLE).where({ perfil_id: perfis.ADMIN });
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
        if (user.senha) {
            const hash = await bcrypt.hash(user.senha, 10);
            user.senha = hash;
        }
        return await db(TABLE).update(user).where({ id });
    },
    async updateDadosJuridico(id, juridico, local) {

        try {
            await db(TABLE_JURIDIC).insert({ id, ...juridico });
        } catch (error) {
            try {
                await db(TABLE_JURIDIC).update(juridico).where({ id });
            } catch (error) {
                throw (error);
            }
        }

        try {
            console.log('Vai inserir o endereco');
            await db(TABLE_ADDRESS).insert({ pessoa_juridica_id: id, ...local });
        } catch (error) {
            console.log('Deu ruim', error)
            try {
                await db(TABLE_ADDRESS).update(local).where({pessoa_juridica_id: id});
            } catch (error) {
                throw error;
            }
        }
    },
    async atualizarSaldo(id, deposito) {
        let { saldo } = await db.select('saldo').from(TABLE).where({ id }).first();
        saldo = parseFloat(saldo);
        saldo += deposito;
        return await db(TABLE).update({ saldo }).where({ id });
    }
}

