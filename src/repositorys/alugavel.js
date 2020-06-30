const db = require('./../configs/knex');
const TABLE = 'alugavel';

const Info = require('./../repositorys/info');
const Tipo = require('./../repositorys/tipo');
const Local = require('./../repositorys/local');
const Caracteristica = require('./../repositorys/caracteristica');
const AlugavelImagem = require('./../repositorys/alugavel_imagem');
const AlugavelCaracteristica = require('./../repositorys/alugavel_caracteristica');

module.exports = {
    async getAll() {
        let alugaveis = await db(TABLE);
        for (let alugavel of alugaveis) {
            alugavel.caracteristicas = [];
            alugavel.tipo = await Tipo.getById(alugavel.tipo_id);
            alugavel.imagens = await AlugavelImagem.getAllByAlugavelId(alugavel.id);
            delete alugavel.tipo_id;
            let tempCaracteristicas = await AlugavelCaracteristica.getAllCaracteristicas(alugavel.id);
            for (let tempCaracteristica of tempCaracteristicas) {
                let caracteristica = await Caracteristica.getById(tempCaracteristica.caracteristica_id);
                caracteristica.valor = tempCaracteristica.valor;
                alugavel.caracteristicas.push(caracteristica);
            }
        }

        return alugaveis;
    },
    async getById(id) {
        let alugavel = await db(TABLE).where({ id }).first();
        alugavel.caracteristicas = [];
        alugavel.imagens = await AlugavelImagem.getAllByAlugavelId(id);
        alugavel.tipo = await Tipo.getById(alugavel.tipo_id);
        delete alugavel.tipo_id;
        let tempCaracteristicas = await AlugavelCaracteristica.getAllCaracteristicas(id);
        for (let tempCaracteristica of tempCaracteristicas) {
            let caracteristica = await Caracteristica.getById(tempCaracteristica.caracteristica_id);
            caracteristica.valor = tempCaracteristica.valor;
            alugavel.caracteristicas.push(caracteristica);
        }

        return alugavel;
    },
    async save(alugavel, caracteristicas, infos, local) {
        try {
            const id = await db(TABLE).insert(alugavel).returning('id');
            if (caracteristicas) {
                caracteristicas.forEach(async (caracteristica) => {
                    await AlugavelCaracteristica.relacionar(id[0], caracteristica.caracteristica_id, caracteristica.valor);
                });
            }

            if (infos) {
                infos.forEach(async (info) => {
                    info.alugavel_id = id[0];
                    await Info.save(info);
                });
            }

            await Local.save(local, id[0]);

            return await db(TABLE).where({ id: id[0] }).first();
        } catch(error) {
            throw error;
        }
    },
    async update(id, alugavel) {
        try {
            return await db(TABLE).update(alugavel).where({ id });
        } catch (error) {
            throw error;
        }
    }
}