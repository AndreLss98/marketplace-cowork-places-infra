const router = require('express').Router();

const Questionario = require('../repositorys/questionario');

router.get('/', async (req, res, next) => {
    return res.status(200).send(await Questionario.getAll());
});

router.post('/', async (req, res, next) => {
    const { pergunta } = req.body;
    if (!pergunta) return res.status(400).send({ error: 'Question is required' });

    try {
        const reponse = await Questionario.save({ pergunta });
        return res.status(200).send(reponse);
    } catch (error) {
        return res.status(400).send({ error: "Register failed" });
    }
});

module.exports = app => app.use('/questionario', router);