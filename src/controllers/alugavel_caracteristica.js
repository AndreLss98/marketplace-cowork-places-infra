const router = require('express').Router();
const AlugavelCaracteristica = require('./../repositorys/alugavel_caracteristica');

const authMiddleware = require('./../middlewares/auth');

router.get('/all/:id', async (req, res, next) => {
    const { id } = req.params;

    res.status(200).send(await AlugavelCaracteristica.getAllCaracteristicas(id));
});

router.put('/:alugavel_id', async (req, res, next) => {
    const alugavel = parseInt(req.params.alugavel_id);

    const { valor, caracteristica_id } = req.body;

    const response = await AlugavelCaracteristica.atualizarValor(alugavel, caracteristica_id, valor);

    res.status(200).send({ response });
});

router.delete('/', async (req, res, next) => {
    const alugavel = parseInt(req.query.alugavel);
    const caracteristica = parseInt(req.query.caracteristica);

    const response = await AlugavelCaracteristica.removerRelacionamento(alugavel, caracteristica);

    res.status(200).send({ response });
});

router.post('/', async (req, res, next) => {
    const { caracteristicas } = req.body;

    if (caracteristicas) {
        caracteristicas.forEach(async (caracteristica) => {
            const { alugavel_id, caracteristica_id, valor } = caracteristica;
            await AlugavelCaracteristica.realacionar(alugavel_id, caracteristica_id, valor);
        });
    }

    res.status(200).send({ response: 1 });
});

module.exports = app => app.use('/alugavel-caracteristica', authMiddleware, router);