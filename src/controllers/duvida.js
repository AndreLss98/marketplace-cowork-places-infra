const router = require('express').Router();

const Duvida = require('./../repositorys/duvida');

const authMiddleware = require('./../middlewares/auth');

router.post('/', async (req, res, next) => {
    const duvida = await Duvida.save(req.body);
    if (!duvida) return res.status(400).send({ error: "Registration failed" });
    res.status(200).send(duvida);
});

router.put('/:id', async (req, res, next) => {
    const response = await Duvida.update(req.body);

    res.status(200).send({ response });
});

module.exports = app => app.use('/duvidas', authMiddleware, router);