const router = require('express').Router();

const Banco = require('./../repositorys/banco');

router.get('/', async (req, res, next) => {
    const bancos = await Banco.getAll();
    return res.status(200).send(bancos);
});

module.exports = app => app.use('/bancos', router);