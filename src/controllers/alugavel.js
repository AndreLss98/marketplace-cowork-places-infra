const router = require('express').Router();

const multer = require('multer');
const multerConfig = require('./../configs/multer');

const Info = require('./../repositorys/info');
const Local = require('./../repositorys/local');
const Duvida = require('./../repositorys/duvida');
const Alugavel = require('../repositorys/alugavel');
const Caracteristica = require('./../repositorys/caracteristica');
const Documentos = require('./../repositorys/documentos_alugavel');
const AlugavelImagem = require('./../repositorys/alugavel_imagem');
const DiasReservados = require('./../repositorys/dias_reservados');
const AlugavelCaracteristica = require('./../repositorys/alugavel_caracteristica');

const authMiddleware = require('./../middlewares/auth');
const paginationMiddleware = require('./../middlewares/pagination');

const perfis = require('./../shared/perfis');
const shared = require('./../shared/functions');
const constants = require('./../shared/constants');

async function validateDates(idAlugavel, dataEntrada) {
    let dataSaida = (await DiasReservados.getLastDateOfRent(idAlugavel)).data_saida;
    dataSaida = new Date(dataSaida);
    console.log("Data saida: ", dataSaida);
    console.log("Data entrada: ", dataEntrada);
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
 * Retorna todas as informacoes de um alugavel 
 */
router.get('/:id/infos', async (req, res, next) => {
    const { id } = req.params;

    res.status(200).send(await Info.getAll(id));
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
        infos, local, anunciante_id,
        tipo_id, descricao, valor, titulo,
        proprietario, taxa, imagens, documentos
    } = req.body;

    let tempAlugavel = { anunciante_id, tipo_id, descricao, valor, titulo };
    if (proprietario) tempAlugavel.proprietario = proprietario;
    if (taxa) tempAlugavel.taxa = taxa;

    if (!local) return res.status(400).send({ error: "Invalid address" });
    if (!anunciante_id) return res.status(400).send({ error: "Advertiser id is required" });
    if (!tipo_id) return res.status(400).send({ error: "Type id is required" });
    if (!titulo) return res.status(400).send({ error: "Title is required" });
    if (!imagens || imagens.length === 0) return res.status(400).send({ error: "Images is required" });
    if (!documentos || documentos.length === 0) return res.status(400).send({ error: "Documents is required" });

    const alugavel = await Alugavel.save(tempAlugavel, caracteristicas, infos, local);
    await AlugavelImagem.relacionar(alugavel.id, imagens);
    await Documentos.relacionar(alugavel.id, documentos);

    try {
        return res.status(200).send(alugavel);
    } catch(error) {
        return res.status(400).send({ error });
    }
});

/**
 * Busca os documentos salvos de um alugavel
 */
router.get('/:id/documentos', async (req, res, next) => {
    const { id } = req.params;
    const documentos = await Documentos.getAllByAlugavelId(id);
    return res.status(200).send(documentos);
});

/**
 * Salva um documento de um alugavel
 */
router.post('/documentos', authMiddleware(), multer(multerConfig('doc')).single('file'), async (req, res, next) => {
    const url = req.file.key;
    const { nome } = req.body;

    if (!nome) return res.status(400).send({ error: "Document name is required" });

    const documento = { url, nome };
    try {
        const doc = await Documentos.save(documento);
        return res.status(200).send(doc);
    } catch(error) {
        return res.status(400).send({ error: "Register failed", trace: error });
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
    const img = await AlugavelImagem.save(req.file.key);
    delete img.alugavel_id;
    res.status(200).send({ img });
});

/**
 * Deleta uma imagem
 */
router.delete('/:id/imagem/:imgId', authMiddleware(), async (req, res, next) => {
    let { imgId } = req.params;
    imgId = parseInt(imgId);
    const response = await AlugavelImagem.delete(imgId);
    res.status(200).send({ response });
});

/**
 * Atualiza um alugavel
 */
router.put('/:id', authMiddleware(), async (req, res, next) => {
    const { id } = req.params;
    const alugavel = await Alugavel.getById(id);

    delete req.body.status;

    if (!alugavel) return res.status(404).send({ error: "Not found" });

    try {
        const response = await Alugavel.update(id, req.body);
        return res.status(200).send({ response });
    } catch(err) {
        return res.status(400).send({ error: "Update failed" });
    }
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

router.put('/:id/status', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).send({ error: "Status is required" });

    const response = await Alugavel.update(id, { status });

    return res.status(200).send({ response });
});

module.exports = app => app.use('/alugaveis', router);
