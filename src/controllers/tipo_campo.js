const router = require('express').Router();

const TipoCampo = require('./../repositorys/tipo_campo');

const authMiddleware = require('./../middlewares/auth');
const perfis = require('./../shared/perfis');

router.get('/', async (req, res, next) => {
    
}); 

module.exports = app => app.use('/tipos-campo', router);