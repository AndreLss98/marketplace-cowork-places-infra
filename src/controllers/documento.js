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
    const { nome, avancado, icone } = req.body;
    if (!nome) return res.status(400).send({ error: "Name is required" });
    if (avancado === undefined || avancado === null) return res.status(400).send({ error: "Is Advanced?" });
    
    let documento = { nome, avancado };
    if (icone) documento.icone = icone;

    try {
        const response = await Documento.save(documento);
        return res.status(200).send(response);
    } catch(error) {
        return res.status(400).send({ error: "Register failed", trace: error });
    }
});

routes.put('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;
    try {
        const response = await Documento.update(id, req.body);
        return res.status(200).send({ response });
    } catch(error) {
        return res.status(400).send({ error: "Register Failed" });
    }
});

routes.delete('/:id', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    const { id } = req.params;
    const response = await Documento.delete(id);
    return res.status(200).send({ response });
});

module.exports = app => app.use('/documentos', routes);