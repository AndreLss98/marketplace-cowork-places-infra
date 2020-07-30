const router = require('express').Router();

const authMiddleware = require('./../middlewares/auth');

const Tipo = require('./../repositorys/tipo');

const perfis = require('./../shared/perfis');

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

router.post('/', authMiddleware([perfis.ADMIN]), async (req, res, next) => {
    if (!req.body.nome) return res.status(400).send({ error: "Name is required" });
    if (!req.body.icone) return res.status(400).send({ error: "Icon is required" });
    if (!req.body.descricao) return res.status(400).send({ error: "Description is required" });

    try {
        const tipo = await Tipo.save(req.body);
        return res.status(200).send(tipo)
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
        return res.status(400).send({ error: "Name already exists" });
    }
});

module.exports = app => app.use('/tipos', router);
