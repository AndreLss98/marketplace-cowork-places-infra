const router = require('express').Router();

const Questionario = require('../repositorys/questionario');

const authMiddleware = require('./../middlewares/auth');

const perfis = require('./../shared/perfis');

router.get('/', async (req, res, next) => {
    return res.status(200).send(await Questionario.getAll());
});

router.post('/', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { pergunta } = req.body;
    if (!pergunta) return res.status(400).send({ error: 'Question is required' });

    try {
        const reponse = await Questionario.save({ pergunta });
        return res.status(200).send(reponse);
    } catch (error) {
        return res.status(400).send({ error: "Register failed" });
    }
});

router.put('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;
    const { pergunta } = req.body;
    if (!pergunta) return res.status(400).send({ error: 'Question is required' });

    try {
        const reponse = await Questionario.update(id, pergunta);
        return res.status(200).send(reponse);
    } catch (error) {
        return res.status(400).send({ error: "Register failed" });
    }
});

router.delete('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;
    try {
        const reponse = await Questionario.delete(id);
        return res.status(200).send({ reponse });
    } catch (error) {
        return res.status(400).send({ error })
    }
});

module.exports = app => app.use('/questionario', authMiddleware(), router);