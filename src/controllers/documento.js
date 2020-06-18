const routes = require('express').Router();
const Documento = require('../repositorys/documento');

const authMiddleware = require('./../middlewares/auth');

const perfis = require('./../shared/perfis');

routes.get('/', async (req, res, next) => {
    return res.status(200).send(await Documento.getAll());
});

routes.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    const documento = await Documento.getById(id);
    if (!documento) return res.status(404).send({ error: "Document Not Found" });
    return res.status(200).send(documento);
});

routes.post('/', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { nome, avancado } = req.body;
    if (!nome) return res.status(400).send({ error: "Name is required" });
    if (avancado === undefined ||avancado === null) return res.status(400).send({ error: "Is Advanced?" });

    try {
        const documento = await Documento.save({ nome, avancado });
        return res.status(200).send(documento);
    } catch(error) {
        return res.status(400).send({ error: "Register failed", trace: error });
    }
});

module.exports = app => app.use('/documentos', routes);