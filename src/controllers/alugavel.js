const router = require('express').Router();

const Alugavel = require('../repositorys/alugavel');

const authMiddleware = require('./../middlewares/auth');

router.get('/', async (req, res, next) => {
    res.status(200).send(await Alugavel.getAll());
});

router.get('/:id', async (req, res, next) => {
    const alugavel = await Alugavel.getById(req.params.id);
    if (!alugavel) res.status(404).send({ error: "Not found" });
    res.status(200).send(alugavel);
});

router.post('/', async (req, res, next) => {

    const { caracteristicas, usuario_id, tipo_id, descricao, valor } = req.body;

    const alugavel = { usuario_id, tipo_id, descricao, valor };

    try {
        return res.status(200).send(await Alugavel.save(alugavel, caracteristicas));
    } catch(error) {
        return res.status(400).send({ error });
    }
});

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

module.exports = app => app.use('/alugaveis', authMiddleware, router);
