const db = require('./../configs/knex');
const TABLE = 'alugavel';

const Info = require('./info');
const Tipo = require('./tipo');
const Local = require('./local');
const Aluguel = require('./aluguel');
const Usuario = require('./usuario');
const Caracteristica = require('./caracteristica');
const AlugavelImagem = require('./alugavel_imagem');
// const Documentos = require('./tipo_alugavel_documento');
const AlugavelCaracteristica = require('./alugavel_caracteristica');

async function createQuery(filters = {}) {
    const { limit, minValue, maxValue, bairro, cidade, minArea, maxArea } = filters;
    delete filters.limit;
    delete filters.minValue;
    delete filters.maxValue;
    delete filters.bairro;
    delete filters.cidade;
    delete filters.minArea;
    delete filters.maxArea;

    let query = db(TABLE).where(filters);

    if (minValue || maxValue) {
        if (minValue && !maxValue) {
            query = query.where('valor', '>=', minValue);
        } else if (maxValue && !minValue) {
            query = query.where('valor', '<=', maxValue);
        } else {
            query = query.whereBetween('valor', [minValue, maxValue]);
        }
    }

    if (bairro || cidade) {
        console.log(cidade);
        query = query.select(`${TABLE}.*`).innerJoin('local', `${TABLE}.id`, `local.alugavel_id`).where(bairro? 'bairro': 'cidade', 'like', `%${bairro || cidade}%`);
    }

    if (minArea || maxArea) {
        if (minArea && maxArea) {
            query = query.whereIn('id', function () {
                this.select('alugavel_id').from('alugavel_caracteristica').whereRaw(`caracteristica_id = 1 and cast(valor as integer) between ${minArea} and ${maxArea}`);
            });
        } else if (minArea && !maxArea) {
            query = query.whereIn('id', function () {
                this.select('alugavel_id').from('alugavel_caracteristica').whereRaw(`caracteristica_id = 1 and cast(valor as integer) >= ${minArea}`);
            });
        } else {
            query = query.whereIn('id', function () {
                this.select('alugavel_id').from('alugavel_caracteristica').whereRaw(`caracteristica_id = 1 and cast(valor as integer) <= ${maxArea}`);
            });
        }
    }

    if (limit) query = query.limit(limit);

    return query;
};

async function getMoreInfo(alugavel) {
    alugavel.caracteristicas = [];

    alugavel.infos = await Info.getAll(alugavel.id);
    alugavel.tipo = await Tipo.getById(alugavel.tipo_id);
    alugavel.local = await Local.getByAlugavelId(alugavel.id);
    // alugavel.documentos = await Documentos.getAllByAlugavelId(alugavel.id);
    alugavel.imagens = await AlugavelImagem.getAllByAlugavelId(alugavel.id);
    alugavel.anunciante_avaliado = (await Usuario.getById(alugavel.anunciante_id)).status_cadastro;

    let caracteristicas = await AlugavelCaracteristica.getAllCaracteristicas(alugavel.id);
    for (let caracteristica of caracteristicas) {
        let tempCaracteristica = await Caracteristica.getById(caracteristica.caracteristica_id);
        tempCaracteristica.valor = caracteristica.valor;
        alugavel.caracteristicas.push(tempCaracteristica);
    }

    alugavel.nota = await getAvaliacoes(alugavel.id);

    delete alugavel.tipo_id;
    for (let info of alugavel.infos) {
        delete info.alugavel_id;
    }

    return alugavel;
}

async function getAvaliacoes(alugavel_id) {
    const alugueis = await Aluguel.getAllByAlugavelId(alugavel_id);

    if (alugueis && alugueis.length > 6) {
        return alugueis.reduce((soma, aluguel) => soma += aluguel.nota, 0) / alugueis.length;
    }

    return null;
}

module.exports = {
    async getAll(filters = {}) {
        let alugaveis = await createQuery(filters);

        for (let alugavel of alugaveis) {
            alugavel = await getMoreInfo(alugavel);
        }

        return alugaveis;
    },
    async getById(id) {
        let alugavel = await db(TABLE).where({ id }).first();
        if (!alugavel) return alugavel;
        return await getMoreInfo(alugavel);
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
        } catch (error) {
            throw error;
        }
    },
    async update(id, alugavel, caracteristicas, infos, local) {
        try {
            await db(TABLE).update(alugavel).where({ id });
            const oldCaracteristicas = (await AlugavelCaracteristica.getAllCaracteristicas(id)).map(caracteristica => caracteristica.caracteristica_id);

            let newCaracteristicas = [];

            if (caracteristicas) {
                newCaracteristicas = caracteristicas.filter(caracteristica => !oldCaracteristicas.includes(caracteristica.caracteristica_id));
            }

            if (newCaracteristicas && newCaracteristicas.length > 0) {
                newCaracteristicas.forEach(async (caracteristica) => {
                    await AlugavelCaracteristica.relacionar(id, caracteristica.caracteristica_id, caracteristica.valor);
                });
            }

            if (caracteristicas && caracteristicas.length > 0) {
                caracteristicas.forEach(async (caracteristica) => {
                    await AlugavelCaracteristica.atualizarValor(id, caracteristica.caracteristica_id, caracteristica.valor);
                });
            }

            if (infos && infos.length > 0) {
                infos.forEach(async (info) => {
                    info.alugavel_id = id;
                    if (!info.id) {
                        await Info.save(info);
                    } else {
                        await Info.update(info);
                    }
                });
            }
            if (local) {
                local.alugavel_id = id;
                await Local.update(local);
            }
            return 1;
        } catch (error) {
            throw error;
        }
    },
    async getLocadorByAlugavel(id) {
        return await db.select('anunciante_id').from(TABLE).where({ id }).first();
    }
}