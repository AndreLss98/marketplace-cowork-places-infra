const router = require('express').Router();

const Duvida = require('./../repositorys/duvida');

const authMiddleware = require('./../middlewares/auth');

router.put('/:id', async (req, res, next) => {

    const { id } = req.params;

    delete req.body.usuario_id;
    delete req.body.alugavel_id;

    const response = await Duvida.update(id, req.body);
    res.status(200).send({ response });
});

module.exports = app => app.use('/duvidas', authMiddleware, router);