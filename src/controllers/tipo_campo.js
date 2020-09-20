const router = require('express').Router();

const TipoCampo = require('./../repositorys/tipo_campo');

const authMiddleware = require('./../middlewares/auth');
const perfis = require('./../shared/perfis');

router.get('/', async (req, res, next) => {
    
});

router.delete('/:id', authMiddleware([perfis.ADMIN]), (req, res, next) => {
    return res.status(200).send({ response: TipoCampo.deletePossibilidade(req.params.id) });
});

module.exports = app => app.use('/tipo-campos', router);