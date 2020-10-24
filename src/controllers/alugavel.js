const { BACK_END_URL } = process.env;
const router = require('express').Router();

const multer = require('multer');
const multerConfig = require('./../configs/multer');

const Info = require('./../repositorys/info');
const Tipo = require('./../repositorys/tipo');
const Local = require('./../repositorys/local');
const Duvida = require('./../repositorys/duvida');
const Alugavel = require('../repositorys/alugavel');
const Usuario = require('./../repositorys/usuario');
const Caracteristica = require('./../repositorys/caracteristica');

const Documentos = require('./../repositorys/tipo_alugavel_documento');

const AlugavelImagem = require('./../repositorys/alugavel_imagem');
const DiasReservados = require('./../repositorys/dias_reservados');
const AlugavelCaracteristica = require('./../repositorys/alugavel_caracteristica');

const authMiddleware = require('./../middlewares/auth');
const paginationMiddleware = require('./../middlewares/pagination');

const PAYPAL = require('./../shared/paypal');
const perfis = require('./../shared/perfis');
const shared = require('./../shared/functions');
const constants = require('./../shared/constants');
const { ALUGAVEL_STATUS } = require('./../shared/constants');

async function validateDates(idAlugavel, dataEntrada) {
    let dataSaida = (await DiasReservados.getLastDateOfRent(idAlugavel)).data_saida;
    dataSaida = new Date(dataSaida);
    return dataEntrada <= dataSaida;
}

/**
 * Retorna todos os alugaveis
 */
router.get('/', paginationMiddleware(Alugavel.getAll), async (req, res, next) => {
    return res.status(200).send(res.result);
});

/**
 * Retorna todos os alugaveis do usuario
 */
router.get('/usuario', async (req, res, next) => {
    const { anunciante_id } = req.query;
    if (anunciante_id) return res.status(200).send(await Alugavel.getAll({anunciante_id}));

    const user = shared.decodeToken(req.headers.authorization);
    if (!user) return res.status(401).send({ error: "User not identified" });

    return res.status(200).send(await Alugavel.getAll({anunciante_id: user.id}));
});

/**
 * Retorna valor maximo da taxa de serviço
 */
router.get('/taxa', async (req, res, next) => {
    return res.status(200).send({ taxa: constants.TAXA_ALUGAVEL })
});

/**
 * Retorna um alugavel
 */
router.get('/:id', async (req, res, next) => {
    const alugavel = await Alugavel.getById(req.params.id);
    if (!alugavel) res.status(404).send({ error: "Not found" });
    res.status(200).send(alugavel);
});

/**
 * Retorna todos bairros cadastrados
 */
router.get('/local/bairros', async (req, res, next) => {
    let filters = req.query.filters? JSON.parse(req.query.filters) : {};
    const response = await Local.getAllBairros(filters);
    return res.status(200).send(response);
});

/**
 * Retorna todas cidades cadastrados
 */
router.get('/local/cidades', async (req, res, next) => {
    let filters = req.query.filters? JSON.parse(req.query.filters) : {};
    const response = await Local.getAllCidades(filters);
    return res.status(200).send(response);
});

/**
 * Retorna todas as informacoes adicionais de um alugavel 
 */
router.get('/:id/infos', async (req, res, next) => {
    const { id } = req.params;

    res.status(200).send(await Info.getAll(id));
});

/**
 * Deleta uma informacao adicional de um alugavel 
 */
router.delete('/:id/infos/:idInfo', async (req, res, next) => {
    const { idInfo } = req.params;
    const response = await Info.delete(idInfo);
    res.status(200).send({ response });
});

/**
 * Retorna todas as caracteristicas de um alugavel
 */
router.get('/:id/caracteristicas', async (req, res, next) => {
    const { id } = req.params;
    const usedCaracteristicas = await AlugavelCaracteristica.getAllCaracteristicas(id);

    let caracteristicas = [];

    if (usedCaracteristicas) {

        for (let used of usedCaracteristicas) {
            const caracteristica = await Caracteristica.getById(used.caracteristica_id);
            caracteristicas.push({...caracteristica, valor: used.valor});
        }
    }

    res.status(200).send(caracteristicas);
});

/**
 * Salva um alugavel
 */
router.post('/', authMiddleware(), async (req, res, next) => {
    const {
        caracteristicas,
        infos, local,
        tipo_id, descricao, valor, valor_mes, titulo,
        proprietario, taxa, imagens, documentos, cadastro_terceiro,
        qtd_maxima_reservas, pessoajuridica
    } = req.body;

    const user = shared.decodeToken(req.headers.authorization);

    let tempAlugavel = {
        tipo_id, descricao, valor, valor_mes, titulo,
        anunciante_id: user.id, qtd_maxima_reservas, pessoajuridica };
    
    if (!local) return res.status(400).send({ error: "Invalid address" });
    if (!tipo_id) return res.status(400).send({ error: "Type id is required" });
    if (!titulo) return res.status(400).send({ error: "Title is required" });
    if (!imagens || imagens.length === 0) return res.status(400).send({ error: "Images is required" });
    if (!proprietario && !cadastro_terceiro) return res.status(400).send({ error: "Third registration is required if you are not the owner." });

    try {
        const alugavel = await Alugavel.save(tempAlugavel, caracteristicas, infos, local, cadastro_terceiro);
        await AlugavelImagem.relacionar(alugavel.id, imagens);
        await Documentos.relacionarAlugavel(alugavel.id, documentos);
        
        return res.status(200).send(alugavel);
    } catch(error) {
        return res.status(400).send({ error });
    }
});

/**
 * Busca os documentos salvos de um alugavel
 */
router.get('/:id/documentos', async (req, res, next) => {
    // const { id } = req.params;
    // const documentos = await Documentos.getAllByAlugavelId(id);
    // return res.status(200).send(documentos);
    return res.status(200).send({ response: 'Ok' });
});

/**
 * Salva um documento de um alugavel
 */
router.post('/documentos', authMiddleware(), multer(multerConfig('doc')).single('file'), async (req, res, next) => {
    const { location, key } = req.file;
    const { tipo_alugavel_documento_id } = req.body;
    if (!tipo_alugavel_documento_id) return res.status(400).send({ error: "Document type id is required" });

    try {
        const doc = await Documentos.saveDoc(tipo_alugavel_documento_id, location? location : `${BACK_END_URL}/${key}`);
        return res.status(200).send(doc);
    } catch(error) {
        return res.status(400).send({ error, message: "Save doc failed" });
    }
});

/**
 * Retorna todas as imagens do alugavel
 */
router.get('/:id/imagem', async (req, res, next) => {
    const imgs = await AlugavelImagem.getAllByAlugavelId(req.params.id);
    res.status(200).send(imgs);
});

/**
 * Salva uma imagem de um alugavel
 */
router.post('/imagem', authMiddleware(), multer(multerConfig('img')).single('file'), async (req, res, next) => {
    const { location, key } = req.file;
    const img = await AlugavelImagem.save(location? location : `${process.env.BACK_END_URL}/${key}`);
    delete img.alugavel_id;
    res.status(200).send({ img });
});

/**
 * Deleta uma imagem de um alugavel
 */
router.delete('/imagem/:imgId', authMiddleware(), async (req, res, next) => {
    let { imgId } = req.params;
    imgId = parseInt(imgId);
    const response = await AlugavelImagem.delete(imgId);
    res.status(200).send({ response });
});

/**
 * Apaga arquivos enviados ao abandonar um formulario de anuncio
 */
router.delete('/clear', (req, res, next) => {
    const { imgs, docs } = req.body;

    for (let img of imgs) {
        AlugavelImagem.delete(img);
    }

    for (let doc of docs) {
        Documentos.delete(doc);
    }

    return res.status(200).send({ response: 1 });
});

/**
 * Atualiza um alugavel
 */
router.put('/:id', authMiddleware(), async (req, res, next) => {
    const { id } = req.params;
    const alugavel = await Alugavel.getById(id);
    if (!alugavel) return res.status(404).send({ error: "Not found" });

    delete req.body.status;
    delete req.body.anunciante_id;
    delete req.body.nota;

    const {
        caracteristicas,
        infos, local,
        descricao, valor, valor_mes, titulo,
        taxa, imagens, documentos
    } = req.body;

    const status = 'waiting'
    const update = {descricao, valor, valor_mes, titulo, taxa, status};
    // await Documentos.relacionar(id, documentos);
    await AlugavelImagem.relacionar(id, imagens);

    try {
        const response = await Alugavel.update(id, update, caracteristicas, infos, local);
        return res.status(200).send({ response });
    } catch(err) {
        return res.status(400).send({ error: "Update failed" });
    }
});

/**
 * Atualiza status de disponibilidade de um anúncio
 */
router.put('/:id/disponibilidade', authMiddleware(), async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).send({ error: "Status is required" });
    if (status !== ALUGAVEL_STATUS.WAITING && status !== ALUGAVEL_STATUS.REMOVED) return res.status(401).send({ error: "Action not authorized" });

    const alugavel = await Alugavel.getById(id);
    if (!alugavel) return res.status(404).send({ error: "Not found" });

    //Todo: Adicionar regra de negocio relacionado ao alugueis ativos
    const response = await Alugavel.update(alugavel.id, { status });

    return res.status(200).send({ response });
});

/**
 * Relaciona uma lista de caracteristicas ao alugavel
 */
router.post('/caracteristicas', authMiddleware(), async (req, res, next) => {
    const caracteristicas = req.body;

    if (!caracteristicas || caracteristicas.length === 0) return res.status(400).send({ error: "Required one or more features" });

    if (caracteristicas) {
        for (let caracteristica of caracteristicas) {
            const { alugavel_id, caracteristica_id, valor } = caracteristica;
            await AlugavelCaracteristica.relacionar(alugavel_id, caracteristica_id, valor);
        }
    }

    res.status(200).send({ response: 1 });
});

/**
 * Atualiza o valor de uma caracteristica de um alugavel
 */
router.put('/:id/caracteristicas', authMiddleware(), async (req, res, next) => {
    const { id } = req.params;
    
    const { valor, caracteristica_id } = req.body;

    const response = await AlugavelCaracteristica.atualizarValor(id, caracteristica_id, valor);

    res.status(200).send({ response });
});

/**
 * Remove caracteristica do alugavel
 */
router.delete('/:id/caracteristicas', authMiddleware(), async (req, res, next) => {

    const { id } = req.params;
    const { caracteristica_id } = req.body;

    if (!caracteristica_id) return res.status(400).send({ error: "Feature id is required" });

    const response = await AlugavelCaracteristica.removerRelacionamento(id, caracteristica_id);

    res.status(200).send({ response });
});

/**
 * Retorna endereco de um alugavel
 */
router.get('/:id/local', async (req, res, next) => {
    const { id } = req.params;
    res.status(200).send(await Local.getByAlugavelId(id));
});

/**
 * Atualiza os dados do endereco de um alugavel
 */
router.put('/:id/local', authMiddleware(), async (req, res, next) => {
    const response = await Local.update(req.body);
    if (!response) return res.status(400).send({ error: "Update failed" });

    res.status(200).send({ response });
});

/**
 * Retorna todas as duvidas registradas
 */
router.get('/:id/duvidas', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;
    const duvidas = await Duvida.getAllByAlugavelId(id);
    res.status(200).send(duvidas);
});

/**
 * Retorna dias reservadas
 */
router.get('/:id/dias-reservados', async (req, res, next) => {
    const { id } = req.params;
    const dias = await DiasReservados.getAllByAlugavelId(id);

    res.status(200).send(dias);
});

/**
 * Reservar dias manualmente
 */
router.post('/:id/dias-reservados', authMiddleware(), async (req, res, next) => {
    const { id } = req.params;
    const dias = req.body;
    const response = await validateDates(id, dias);

    if (!response) return res.status(400).send({ error: "Day already reserved" });

    for(let dia of dias) {
        try {
            dia.alugavel_id = id;
            delete dia.aluguel_id;
            await DiasReservados.save(dia);
        } catch (error) {
            return res.status(400).send({ error: "Failed to reserve" });
        }
    }

    return res.status(200).send({ response: 1 });
});

/**
 * Valida datas de reserva a serem registradas
 */
router.post('/:id/dias-reservados/validate', async (req, res, next) => {
    const { id } = req.params;
    const { data_entrada } = req.body;
    const reservado = await validateDates(id, new Date(data_entrada));
    console.log('Response: ', reservado);
    if (reservado) return res.status(400).send({ reservado, error: "Invalid period"});
    return res.status(200).send({ reservado });
});

/**
 * Atualiza status de um anúncio
 */
router.put('/:id/status', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;
    const { status, observacao } = req.body;
    if (!status) return res.status(400).send({ error: "Status is required" });
    
    const alugavel = await Alugavel.getById(id);
    if (!alugavel) return res.status(400).send({ error: "Rentable not found" });

    if (status === constants.ALUGAVEL_STATUS.APPROVED && !alugavel.paypal_id) {
        try {
            const img = await AlugavelImagem.getOneByAlugavelId(alugavel.id);
            const { descricao } = await Tipo.getById(alugavel.tipo.id);

            await PAYPAL.createProduct(alugavel, img.url, descricao);
        } catch (error) {
            return res.status(400).send({ error, message: "Erro ao criar objeto na paypal" });
        }
    }
    
    try {
        const user = await Usuario.getById(alugavel.anunciante_id);
        if (status === constants.ALUGAVEL_STATUS.APPROVED) {
            await shared.sendEmail(user.email, constants.NO_REPLY_EMAIL, constants.EMAILS_ANUNCIO.ON_APPROVED.subject, constants.EMAILS_ANUNCIO.ON_APPROVED.email(user, alugavel));
        } else if (status === constants.ALUGAVEL_STATUS.DISAPPROVED) {
            await shared.sendEmail(user.email, constants.NO_REPLY_EMAIL, constants.EMAILS_ANUNCIO.ON_REPROVED.subject, constants.EMAILS_ANUNCIO.ON_REPROVED.email(user, alugavel, observacao));
        }
    } catch (error) {
        console.log(error);
    }
    
    let update = { status };
    if (observacao) update.observacao = observacao;
    const response = await Alugavel.update(id, update);
    return res.status(200).send({ response });
});

module.exports = app => app.use('/alugaveis', router);