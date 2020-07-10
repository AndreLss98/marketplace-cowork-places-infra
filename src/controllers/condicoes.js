const routes = require('express').Router();

const Condicoes = require('./../repositorys/condicoes');

const authMiddleware = require('./../middlewares/auth');

const perfis = require('./../shared/perfis');

routes.get('/', async (req, res, next) => {
    return res.status(200).send(await Condicoes.getAll());
});

routes.post('/', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { descricao } = req.body;
    if (!descricao) return res.status(400).send({ error: "Condition is required" });
    const response = await Condicoes.save({ descricao });
    return res.status(200).send(response);
});

routes.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    const condicao = await Condicoes.getById(id);
    if (!condicao) return res.status(400).send({ error: "Condition not found" });
    return res.status(200).send(condicao);
});

module.exports = app => app.use('/condicoes', routes);