const router = require('express').Router();

const Info = require('./../repositorys/info');
const Local = require('./../repositorys/local');
const Duvida = require('./../repositorys/duvida');
const Alugavel = require('../repositorys/alugavel');
const Caracteristica = require('./../repositorys/caracteristica');
const AlugavelImagem = require('./../repositorys/alugavel_imagem');
const AlugavelCaracteristica = require('./../repositorys/alugavel_caracteristica');

const authMiddleware = require('./../middlewares/auth');
const multerMiddleware = require('./../middlewares/multer');

/**
 * Retorna todos os alugaveis
 */
router.get('/', async (req, res, next) => {
    res.status(200).send(await Alugavel.getAll());
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
            caracteristicas.push(caracteristica);
        }
    }

    res.status(200).send(caracteristicas);
});

/**
 * Salva um alugavel
 */
router.post('/', async (req, res, next) => {

    const { caracteristicas, infos, local, anunciante_id, tipo_id, descricao, valor } = req.body;

    const alugavel = { anunciante_id, tipo_id, descricao, valor };

    if (!local) return res.status(400).send({ error: "Invalid address" });

    try {
        return res.status(200).send(await Alugavel.save(alugavel, caracteristicas, infos, local));
    } catch(error) {
        return res.status(400).send({ error });
    }
});

/**
 * Salva uma imagem de um alugavel
 */
router.post('/:id/imagem', multerMiddleware.single('file'), async (req, res, next) => {
    const img = await AlugavelImagem.save(req.params.id, req.file.key);
    res.status(200).send({ img });
});

/**
 * Deleta uma imagem
 */
router.delete('/:id/imagem/:imgId', async (req, res, next) => {
    let { imgId } = req.params;
    imgId = parseInt(imgId);
    const response = await AlugavelImagem.delete(imgId);
    res.status(200).send({ response });
});

/**
 * Atualiza um alugavel
 */
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const alugavel = await Alugavel.getById(id);

    if (!alugavel) return res.status(404).send({ error: "Not found" });

    try {
        const response = await Alugavel.update(req.body);
        return res.status(200).send({ response });
    } catch(err) {
        return res.status(400).send({ error: "Update failed" });
    }
});

/**
 * Relaciona uma lista de caracteristicas ao alugavel
 */
router.post('/:id/caracteristicas', async (req, res, next) => {
    const { caracteristicas } = req.body;

    if (caracteristicas) {
        for (let caracteristica of caracteristicas) {
            const { alugavel_id, caracteristica_id, valor } = caracteristica;
            await AlugavelCaracteristica.realacionar(alugavel_id, caracteristica_id, valor);
        }
    }

    res.status(200).send({ response: 1 });
});

/**
 * Atualiza o valor de uma caracteristica de um alugavel
 */
router.put('/:id/caracteristica', async (req, res, next) => {
    const { id } = req.params;
    
    const { valor, caracteristica_id } = req.body;

    const response = await AlugavelCaracteristica.atualizarValor(id, caracteristica_id, valor);

    res.status(200).send({ response });
});

/**
 * Remove caracteristica do alugavel
 */
router.delete('/:id/caracteristica', async (req, res, next) => {

    const response = await AlugavelCaracteristica.removerRelacionamento(id, req.body.caracteristica_id);

    res.status(200).send({ response });
});

/**
 * Retorna endereco de em alugavel
 */
router.get('/:id/local', async (req, res, next) => {
    const { id } = req.params;
    res.status(200).send(await Local.getByAlugavelId(id));
});

/**
 * Atualiza os dados do endereco de um alugavel
 */
router.put('/:id/local', async (req, res, next) => {
    const response = await Local.update(req.body);
    if (!response) return res.status(400).send({ error: "Update failed" });

    res.status(200).send({ response });
});

/**
 * Retorna todas as duvidas registradas
 */
router.get('/:id/duvidas', async (req, res, next) => {
    const { id } = req.params;
    const duvidas = await Duvida.getAllByAlugavelId(id);
    res.status(200).send(duvidas);
});

module.exports = app => app.use('/alugaveis', authMiddleware, router);
