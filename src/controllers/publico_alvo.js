const router = require('express').Router();

const perfis = require('./../shared/perfis');
const authMiddleware = require('./../middlewares/auth');

const PublicoAlvo = require('./../repositorys/publico_alvo');

router.get('/', async (req, res, next) => {
    return res.status(200).send(await PublicoAlvo.getAll());
});

router.post('/', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { nome } = req.body;

    if (!nome) return res.status(400).send({ error: "Name is required" });

    try {
        const response = await PublicoAlvo.save({ nome });
        return res.status(200).send(response);
    } catch (trace) {
        return res.status(400).send({ error: "Register failed", trace });
    }
});

router.put('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;

    try {
        const response = await PublicoAlvo.update(id, req.body);
        return res.status(200).send({ response });
    } catch (trace) {
        return res.status(400).send({ error: "Update failed", trace });
    }
});

router.delete('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;

    try {
        return res.status(200).send({ response: await PublicoAlvo.del(id) });
    } catch (trace) {
        return res.status(400).send({ error: "Delete failed", trace });
    }
});

module.exports = app => app.use('/publico-alvo', router);