const router = require('express').Router();

const authMiddleware = require('./../middlewares/auth');

const Tipo = require('./../repositorys/tipo');

const perfis = require('./../shared/perfis');
const caracteristica = require('../repositorys/caracteristica');

router.get('/', async (req, res, next) => {
    let filters = {};
    if (req.query.filters) filters = JSON.parse(req.query.filters);

    const tipos = await Tipo.getAll(filters);
    res.status(200).send(tipos);
});

router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    const tipo = await Tipo.getById(id);
    if (!tipo) return res.status(404).send({ error: "Not found" });
    res.status(200).send(tipo);
});

router.get('/:id/caracteristicas', async (req, res, next) => {
    const { id } = req.params;
    const tipo = await Tipo.getById(id);
    const caracteristicasIds = await Tipo.getAllCaracteristicas(tipo.id);
    let caracteristicas = [];
    for (let caracteristicaId of caracteristicasIds) {
        caracteristicas.push(await caracteristica.getById(caracteristicaId.caracteristica_id));
    }
    res.status(200).send(caracteristicas);
});

router.post('/', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { nome, icone, descricao, caracteristicas } = req.body;
    if (!nome) return res.status(400).send({ error: "Name is required" });
    if (!icone) return res.status(400).send({ error: "Icon is required" });
    if (!descricao) return res.status(400).send({ error: "Description is required" });
    let tipo = { nome, icone, descricao };
    if (caracteristicas) tipo = { ...tipo, caracteristicas };
    try {
        const response = await Tipo.save(tipo);
        return res.status(200).send(response);
    } catch (error) {
        return res.status(400).send({ error: "Registration failed"});
    }
});

router.put('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;
    const tipo = await Tipo.getById(id);

    if (!tipo) return res.status(404).send({ error: "Not found" });

    try {
        return res.status(200).send({ response: await Tipo.update(id, req.body) });
    } catch(err) {
        return res.status(400).send({ error: err });
    }
});

router.delete('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;
    const tipo = await Tipo.getById(id);
    if (!tipo) return res.status(404).send({ error: "Not Found" });
    try {
        const response = await Tipo.delete(id);
        return res.status(200).send({ response });
    } catch (error) {
        return res.status(400).send({ error });
    }
});

module.exports = app => app.use('/tipos', router);
