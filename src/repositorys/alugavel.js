const db = require('./../configs/knex');

const TABLE = 'alugavel';
const TABLE_ENDERECO = 'endereco';
const TABLE_CADASTRO_TERCEIRO = 'cadastro_terceiro';
const TABLE_PUBLICO_ALVO_ALUGAVEL = 'publico_alvo_alugavel';

const Info = require('./info');
const Tipo = require('./tipo');
const Local = require('./local');
const Aluguel = require('./aluguel');
const Usuario = require('./usuario');
const Caracteristica = require('./caracteristica');
const AlugavelImagem = require('./alugavel_imagem');
const Documentos = require('./tipo_alugavel_documento');
const AlugavelCaracteristica = require('./alugavel_caracteristica');

async function createQuery(filters = {}) {
    const { limit, minValue, maxValue, bairro, cidade } = filters;
    delete filters.limit;
    delete filters.bairro;
    delete filters.cidade;
    delete filters.minValue;
    delete filters.maxValue;

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
        query = query.select(`${TABLE}.*`).innerJoin('local', `${TABLE}.id`, `local.alugavel_id`).where(bairro ? 'bairro' : 'cidade', 'like', `%${bairro || cidade}%`);
    }

    if (limit) query = query.limit(limit);
    return query;
};

async function getMoreInfo(alugavel) {
    alugavel.caracteristicas = [];

    alugavel.infos = await Info.getAll(alugavel.id);
    alugavel.tipo = await Tipo.getById(alugavel.tipo_id);
    alugavel.local = await Local.getByAlugavelId(alugavel.id);
    alugavel.documentos = await Documentos.getAllByAlugavelId(alugavel.id);
    alugavel.imagens = await AlugavelImagem.getAllByAlugavelId(alugavel.id);
    alugavel.anunciante_avaliado = (await Usuario.getById(alugavel.anunciante_id)).status_cadastro;
    alugavel.anunciante_img = (await Usuario.getById(alugavel.anunciante_id)).img_perfil;
    alugavel.publico_alvo = (await db.select("publico_alvo.nome").table(TABLE_PUBLICO_ALVO_ALUGAVEL).innerJoin("publico_alvo", "publico_alvo.id", "publico_alvo_alugavel.publico_alvo_id"));

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

    if (!alugavel.proprietario) {
        alugavel.cadastro_terceiro = await db(TABLE_CADASTRO_TERCEIRO).where({ alugavel_id: alugavel.id }).first();
        delete alugavel.cadastro_terceiro.alugavel_id;
        alugavel.cadastro_terceiro.local = await db(TABLE_ENDERECO).where({ cadastro_terceiro_id: alugavel.cadastro_terceiro.id }).first();
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
    async getBySearchKey(search_key, keys = ['*']) {
        try {
            return await db.column(keys).from(TABLE).where(search_key).first();
        } catch (error) {
            throw error;
        }
    },
    async save(alugavel, caracteristicas, infos, local, cadastro_terceiro, publico_alvo) {
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

            if (cadastro_terceiro) {
                const cadastro_terceiro_local = cadastro_terceiro.local;
                delete cadastro_terceiro.local;
                let id_cadastro_terceiro;
                try {

                    if (!alugavel.pessoajuridica) {
                        id_cadastro_terceiro = await db(TABLE_CADASTRO_TERCEIRO).insert({
                            cpf: cadastro_terceiro.cpf,
                            nome: cadastro_terceiro.nome,
                            alugavel_id: id[0]
                        }).returning('id');
                    } else {
                        id_cadastro_terceiro = await db(TABLE_CADASTRO_TERCEIRO).insert({
                            cnpj: cadastro_terceiro.cnpj,
                            razao_social: cadastro_terceiro.razao_social,
                            alugavel_id: id[0]
                        }).returning('id');
                    }
                } catch (error) {
                    throw error;
                }

                try {
                    await db(TABLE_ENDERECO).insert({
                        ...cadastro_terceiro_local,
                        cadastro_terceiro_id: id_cadastro_terceiro[0]
                    });
                } catch (error) {
                    throw error;
                }
            }

            if (publico_alvo) {
                publico_alvo.forEach(async (pub) => {
                    await db(TABLE_PUBLICO_ALVO_ALUGAVEL).insert({ publico_alvo_id: pub, alugavel_id: id[0] });
                });
            }

            await Local.save(local, id[0]);
            return await db(TABLE).where({ id: id[0] }).first();
        } catch (error) {
            throw error;
        }
    },
    async update(id, alugavel, caracteristicas, infos, local, cadastro_terceiro, publico_alvo) {

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

            if (cadastro_terceiro) {
                const cadastro_terceiro_local = cadastro_terceiro.local;
                delete cadastro_terceiro.local;

                try {
                    if (!alugavel.pessoajuridica) {
                        await db(TABLE_CADASTRO_TERCEIRO).update({
                            cnpj: '',
                            razao_social: '',
                            cpf: cadastro_terceiro.cpf,
                            nome: cadastro_terceiro.nome
                        }).where({ id: cadastro_terceiro.id });
                    } else {
                        await db(TABLE_CADASTRO_TERCEIRO).update({
                            cpf: '',
                            nome: '',
                            cnpj: cadastro_terceiro.cnpj,
                            razao_social: cadastro_terceiro.razao_social
                        }).where({ id: cadastro_terceiro.id });
                    }
                } catch (error) {
                    console.log(error);
                    throw error;
                }

                await db(TABLE_ENDERECO).update({
                    ...cadastro_terceiro_local
                }).where({ cadastro_terceiro_id: cadastro_terceiro.id });
            }

            if (publico_alvo) {
                const old = (await db.select('publico_alvo_id').from(TABLE_PUBLICO_ALVO_ALUGAVEL).where({ alugavel_id: id })).map(el => el.publico_alvo_id);

                console.log(old);

                const news = publico_alvo.filter(el => !old.includes(el));
                const rm = old.filter(el => !publico_alvo.includes(el));

                console.log(news);
                console.log(rm);

                news.forEach(async (el) => {
                    await db(TABLE_PUBLICO_ALVO_ALUGAVEL).insert({ alugavel_id: id, publico_alvo_id: el });
                });

                rm.forEach(async (el) => {
                    await db(TABLE_PUBLICO_ALVO_ALUGAVEL).delete().where({ alugavel_id: id, publico_alvo_id: el });
                });
            }

            return 1;
        } catch (error) {
            throw error;
        }
    },
    async getLocadorByAlugavel(id) {
        return await db.select('anunciante_id').from(TABLE).where({ id }).first();
    },
    async getMostUseds() {
        let useds = await db.select('tipo_id').count('tipo_id', { as: 'qtd' }).from(TABLE).groupBy('tipo_id').orderBy('qtd', 'desc').limit(3);

        let response = []

        for (let used of useds) {
            response.push(await Tipo.getById(used.tipo_id))
        }

        return response;
    }
}